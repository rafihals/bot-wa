import { EventEmitter } from "events";
import pino from "pino";
import NodeCache from "node-cache";
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  getAggregateVotesInPollMessage,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  useMultiFileAuthState,
  Browsers,
  proto,
  WAMessageContent,
  WAMessageKey,
} from "@whiskeysockets/baileys";
import { readFileSync, existsSync, rmSync } from "fs";
import { createHash } from "crypto";

import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

import mime from "mime-types";

import utils from "./utils";
import { join } from "path";

import QRCode from "qrcode";
import fs from "fs";
import path from "path";

interface Args {
  debug?: boolean;
  [key: string]: any; // Define the shape of this object as needed
}

type SendMessageOptions = {
  keyword?: string;
  refresh?: string;
  answer?: string;
  options: {
    capture?: boolean;
    child?: any;
    delay?: number;
    nested?: any[];
    keyword?: any;
    callback?: boolean;
    buttons?: { body: string }[];
    media?: string;
  };
  refSerialize?: string;
};

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const msgRetryCounterCache = new NodeCache();

export class BaileysClass extends EventEmitter {
  private vendor: any;
  private store: any;
  private globalVendorArgs: Args;
  private sock: any;
  private NAME_DIR_SESSION: string;
  private plugin: boolean;
  // Store poll creation messages with their options for decoding poll responses
  private pollMessages: Map<string, { message: any, options: string[] }> = new Map();

  // Helper to compute SHA256 hash of option name (how WhatsApp identifies selected options)
  private hashPollOption(optionName: string): string {
    return createHash('sha256').update(optionName).digest().toString('hex');
  }

  constructor(args = {}) {
    super();
    this.vendor = null;
    this.store = null;
    this.globalVendorArgs = {
      name: `bot`,
      usePairingCode: false,
      phoneNumber: null,
      gifPlayback: false,
      dir: "./",
      ...args,
    };
    this.NAME_DIR_SESSION = `${this.globalVendorArgs.dir}${this.globalVendorArgs.name}_sessions`;
    this.initBailey();

    // is plugin?
    const err = new Error();
    const stack = err.stack;
    this.plugin = stack?.includes("createProvider") ?? false;
  }

  getMessage = async (
    key: WAMessageKey
  ): Promise<WAMessageContent | undefined> => {
    // First check our poll messages cache
    if (key.id && this.pollMessages.has(key.id)) {
      const pollData = this.pollMessages.get(key.id);
      console.log(`📊 getMessage: Found poll message in cache for ${key.id}`);
      console.log(`   Poll options: ${pollData?.options?.join(', ')}`);
      return pollData?.message;
    }
    
    // Then check the store
    if (this.store) {
      const msg = await this.store.loadMessage(key.remoteJid!, key.id!);
      if (msg?.message) {
        console.log(`📊 getMessage: Found message in store for ${key.id}`);
        return msg.message;
      }
    }
    
    console.log(`⚠️ getMessage: Message not found for ${key.id}`);
    // only if store is present
    return proto.Message.fromObject({});
  };

  getInstance = (): any => this.vendor;

  initBailey = async (): Promise<void> => {
    const logger = pino({
      level: this.globalVendorArgs.debug ? "debug" : "fatal",
    });
    const { state, saveCreds } = await useMultiFileAuthState(
      this.NAME_DIR_SESSION
    );
    const { version, isLatest } = await fetchLatestBaileysVersion();

    if (this.globalVendorArgs.debug)
      console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

    this.store = makeInMemoryStore({ logger: logger as any });
    this.store.readFromFile(`${this.NAME_DIR_SESSION}/baileys_store.json`);
    setInterval(() => {
      const path = `${this.NAME_DIR_SESSION}/baileys_store.json`;
      if (existsSync(path)) {
        this.store.writeToFile(path);
      }
    }, 10_000);

    try {
      this.setUpBaileySock({ version, logger, state, saveCreds });
    } catch (e) {
      this.emit("auth_failure", e);
    }
  };

  setUpBaileySock = async ({ version, logger, state, saveCreds }) => {
    this.sock = makeWASocket({
      version,
      logger: logger as any,
      printQRInTerminal:
        this.plugin || this.globalVendorArgs.usePairingCode ? false : true,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger as any),
      },
      browser: Browsers.macOS("Desktop"),
      msgRetryCounterCache,
      generateHighQualityLinkPreview: true,
      getMessage: this.getMessage,
      defaultQueryTimeoutMs: undefined, // Disable default timeout
      syncFullHistory: false, // CRITICAL: Disable history sync to prevent getUSyncDevices timeout
      retryRequestDelayMs: 250,
      fireInitQueries: false, // Disable initial queries that cause timeout
      shouldIgnoreJid: (jid: string) => jid === 'status@broadcast',
      connectTimeoutMs: 60000,
    });

    this.store?.bind(this.sock.ev);

    if (this.globalVendorArgs.usePairingCode) {
      if (this.globalVendorArgs.phoneNumber) {
        await this.sock.waitForConnectionUpdate((update) => !!update.qr);
        const code = await this.sock.requestPairingCode(
          this.globalVendorArgs.phoneNumber
        );
        if (this.plugin) {
          this.emit("require_action", {
            instructions: [
              `Acepta la notificación del WhatsApp ${this.globalVendorArgs.phoneNumber} en tu celular 👌`,
              `El token para la vinculación es: ${code}`,
              `Necesitas ayuda: https://link.codigoencasa.com/DISCORD`,
            ],
          });
        } else {
          this.emit("pairing_code", code);
        }
      } else {
        this.emit("auth_failure", "phoneNumber is empty");
      }
    }

    this.sock.ev.on("connection.update", this.handleConnectionUpdate);
    this.sock.ev.on("creds.update", saveCreds);
  };

  handleConnectionUpdate = async (update: any): Promise<void> => {
    const { connection, lastDisconnect, qr } = update;
    const statusCode = lastDisconnect?.error?.output?.statusCode;

    if (connection === "close") {
      if (statusCode !== DisconnectReason.loggedOut) this.initBailey();
      if (statusCode === DisconnectReason.loggedOut)
        this.clearSessionAndRestart();
    }

    if (connection === "open") {
      this.vendor = this.sock;
      this.initBusEvents(this.sock);
      this.emit("ready", true);
    }

    if (qr && !this.globalVendorArgs.usePairingCode) {
      // Generate QR code as a data URL
      const qrDataUrl = await QRCode.toDataURL(qr);

      // Write HTML content to index.html
      const htmlContent = `
               <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsApp QR Code</title>
</head>
 <script>
        
        setInterval(() => {
            window.location.reload();
        }, 10_000);
    </script>

<body>
    <div class="card">
                    <img src="${qrDataUrl}" alt = "QR Code" style = "width:300px;height:300px;" >

        <div class="card-content">
            <h2>This is private QR code to connect to your WhatsApp account</h2>
            <p>Scan the QR Code to activate bot, Qr code update every minutes</p>
        </div>
    </div>
</body>
<style>
    body {
        margin: 0;
        padding: 0;
        height: 100vh;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #eee;
    }

    .card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: white;
        padding: 10px;
        border-radius: 20px;
        max-width: 300px;
    }

    .card img {
        border-radius: 15px;
    }

    .card-content {
        text-align: center;
        padding: 0 16px;
    }

    .card-content h2 {
        font-size: 22px;
        color: darkblue;
    }

    .card-content p {
        color: #626262;
    }
</style>

</html>`;

      // Write the HTML content to index.html
      fs.writeFileSync(path.join(__dirname, "..", "public", "index.html"), htmlContent);
    }
  };

  clearSessionAndRestart = (): void => {
    const PATH_BASE = join(process.cwd(), this.NAME_DIR_SESSION);
    rmSync(PATH_BASE, { recursive: true, force: true });
    this.initBailey();
  };

  busEvents = (): any[] => [
    {
      event: "messages.upsert",
      func: async ({ messages, type }) => {
        // Ignore non-notify messages
        if (type !== "notify") {
          console.log(`🔇 Ignoring message type: ${type}`);
          return;
        }

        const [messageCtx] = messages;
        
        // Debug: Log raw message
        console.log(`\n📥 RAW MESSAGE RECEIVED:`);
        console.log(`   remoteJid: ${messageCtx?.key?.remoteJid}`);
        console.log(`   fromMe: ${messageCtx?.key?.fromMe}`);
        console.log(`   hasConversation: ${!!messageCtx?.message?.conversation}`);
        console.log(`   hasExtendedText: ${!!messageCtx?.message?.extendedTextMessage}`);
        console.log(`   hasPollUpdate: ${!!messageCtx?.message?.pollUpdateMessage}`);

        // Handle pollUpdateMessage - decode poll response using SHA256 hash matching
        if (messageCtx.message?.pollUpdateMessage) {
          const pollUpdate = messageCtx.message.pollUpdateMessage;
          const pollMsgKey = pollUpdate?.pollCreationMessageKey;
          
          console.log(`\n📊 POLL RESPONSE RECEIVED (messages.upsert)!`);
          console.log(`   Poll creation message ID: ${pollMsgKey?.id}`);
          console.log(`   From: ${messageCtx?.key?.remoteJid}`);
          console.log(`   pollMessages cache size: ${this.pollMessages.size}`);
          console.log(`   pollMessages keys: ${Array.from(this.pollMessages.keys()).join(', ')}`);
          
          const from = messageCtx?.key?.remoteJid;
          
          // Ignore group poll responses
          if (from?.includes("@g.us")) {
            console.log(`🔇 Ignoring group poll response from: ${from}`);
            return;
          }
          
          // Try to find poll in cache
          let pollData: { message: any; options: string[] } | undefined = undefined;
          
          // First try exact match
          if (pollMsgKey?.id && this.pollMessages.has(pollMsgKey.id)) {
            pollData = this.pollMessages.get(pollMsgKey.id);
            console.log(`   Found poll by exact ID match`);
          } else {
            // Fallback: search all polls (in case ID format differs)
            console.log(`   Exact ID not found, searching all cached polls...`);
            for (const [key, data] of this.pollMessages.entries()) {
              console.log(`   Checking poll: ${key}`);
              pollData = data;
              break; // Use the most recent poll as fallback
            }
          }
          
          if (pollData) {
            try {
              const options = pollData.options || [];
              
              console.log(`   Stored poll options: ${options.join(', ')}`);
              
              // Get selected option hashes from vote
              // selectedOptions is an array of Buffers containing SHA256 hashes
              const selectedHashes: string[] = [];
              if (pollUpdate?.vote?.selectedOptions) {
                for (const opt of pollUpdate.vote.selectedOptions) {
                  if (opt) {
                    // Convert Buffer to hex string
                    const hashHex = Buffer.isBuffer(opt) ? opt.toString('hex') : 
                                   (opt instanceof Uint8Array ? Buffer.from(opt).toString('hex') : String(opt));
                    selectedHashes.push(hashHex);
                  }
                }
              }
              console.log(`   Selected hashes: ${selectedHashes.map(h => h.substring(0, 16) + '...').join(', ')}`);
              
              // Match selected hashes with our stored options
              let selectedOption = '';
              for (const optionName of options) {
                const optionHash = this.hashPollOption(optionName);
                console.log(`   Checking: "${optionName}" -> ${optionHash.substring(0, 16)}...`);
                if (selectedHashes.some(h => h === optionHash)) {
                  selectedOption = optionName;
                  console.log(`   ✅ MATCHED: "${optionName}"`);
                  break;
                }
              }
              
              if (selectedOption) {
                let payload = {
                  ...messageCtx,
                  body: selectedOption,
                  from: utils.formatPhone(from, this.plugin),
                  type: "poll",
                };
                
                console.log(`✅ EMITTING poll response - from: ${payload.from}, body: "${payload.body}"`);
                this.emit("message", payload);
              } else {
                console.log(`⚠️ No matching option found for selected hashes`);
              }
            } catch (error) {
              console.error(`❌ Error processing poll response:`, error);
            }
          } else {
            console.log(`⚠️ Poll creation message not found in cache for ID: ${pollMsgKey?.id}`);
          }
          return;
        }

        let payload = {
          ...messageCtx,
          body:
            messageCtx?.message?.extendedTextMessage?.text ??
            messageCtx?.message?.conversation,
          from: messageCtx?.key?.remoteJid,
          type: "text",
        };

        console.log(`   extracted body: "${payload.body}"`);

        // Ignore broadcast messages
        if (payload.from === "status@broadcast") {
          console.log(`🔇 Ignoring status broadcast`);
          return;
        }

        // Ignore messages from self
        if (payload?.key?.fromMe) {
          console.log(`🔇 Ignoring message from self`);
          return;
        }

        // Ignore group messages - only respond to personal chats
        if (payload.from?.includes("@g.us")) {
          console.log(`🔇 Ignoring group message from: ${payload.from}`);
          return;
        }

        // Detect location
        if (messageCtx.message?.locationMessage) {
          const { degreesLatitude, degreesLongitude } =
            messageCtx.message.locationMessage;
          if (
            typeof degreesLatitude === "number" &&
            typeof degreesLongitude === "number"
          ) {
            payload = {
              ...payload,
              body: utils.generateRefprovider("_event_location_"),
              type: "location",
            };
          }
        }
        // Detect  media
        if (messageCtx.message?.imageMessage) {
          payload = {
            ...payload,
            body: utils.generateRefprovider("_event_media_"),
            type: "image",
          };
        }

        // Detect  ectar file
        if (messageCtx.message?.documentMessage) {
          payload = {
            ...payload,
            body: utils.generateRefprovider("_event_document_"),
            type: "file",
          };
        }

        // Detect voice note
        if (messageCtx.message?.audioMessage) {
          payload = {
            ...payload,
            body: utils.generateRefprovider("_event_voice_note_"),
            type: "voice",
          };
        }

        // Check from user and group is valid
        if (!utils.formatPhone(payload.from)) {
          console.log(`🔇 Ignoring: invalid phone format`);
          return;
        }

        const btnCtx =
          payload?.message?.buttonsResponseMessage?.selectedDisplayText;
        if (btnCtx) payload.body = btnCtx;

        const listRowId = payload?.message?.listResponseMessage?.title;
        if (listRowId) payload.body = listRowId;

        payload.from = utils.formatPhone(payload.from, this.plugin);
        console.log(`✅ EMITTING message event - from: ${payload.from}, body: "${payload.body}"`);
        this.emit("message", payload);
      },
    },
    {
      event: "messages.update",
      func: async (message) => {
        console.log(`\n📬 messages.update EVENT TRIGGERED`);
        console.log(`   Total updates: ${message.length}`);
        
        for (const { key, update } of message) {
          console.log(`   Update for ${key.remoteJid}:`);
          console.log(`   - message ID: ${key.id}`);
          console.log(`   - has pollUpdates: ${!!update.pollUpdates}`);
          console.log(`   - update keys: ${Object.keys(update).join(', ')}`);
          
          // Ignore group messages
          if (key.remoteJid?.includes("@g.us")) {
            console.log(`🔇 Ignoring group poll update from: ${key.remoteJid}`);
            continue;
          }
          
          if (update.pollUpdates) {
            console.log(`\n📊 POLL UPDATE DETECTED`);
            console.log(`   remoteJid: ${key.remoteJid}`);
            console.log(`   messageId: ${key.id}`);
            console.log(`   pollMessages cache size: ${this.pollMessages.size}`);
            console.log(`   pollMessages keys: ${Array.from(this.pollMessages.keys()).join(', ')}`);
            
            try {
              const pollCreation = await this.getMessage(key);
              console.log(`   pollCreation found: ${!!pollCreation}`);
              console.log(`   pollCreation type: ${pollCreation ? typeof pollCreation : 'null'}`);
              
              if (pollCreation && pollCreation.pollCreationMessage) {
                console.log(`   ✅ Valid pollCreationMessage structure found`);
                
                const pollMessage = await getAggregateVotesInPollMessage({
                  message: pollCreation,
                  pollUpdates: update.pollUpdates,
                });
                
                console.log(`   pollMessage votes:`, pollMessage.map(p => ({ name: p.name, voters: p.voters.length })));

                const selectedOption = pollMessage.find((poll) => poll.voters.length > 0)?.name || "";
                console.log(`   Selected option: "${selectedOption}"`);

                if (selectedOption) {
                  let payload = {
                    ...message[0],
                    body: selectedOption,
                    from: utils.formatPhone(key.remoteJid, this.plugin),
                    voters: pollCreation,
                    type: "poll",
                  };

                  console.log(`✅ EMITTING poll response - from: ${payload.from}, body: "${payload.body}"`);
                  this.emit("message", payload);
                } else {
                  console.log(`⚠️ No selected option found in poll votes`);
                }
              } else {
                // Fallback: Try to use hash matching from our cache
                console.log(`⚠️ pollCreationMessage structure invalid, trying hash matching fallback`);
                
                if (key.id && this.pollMessages.has(key.id)) {
                  const pollData = this.pollMessages.get(key.id);
                  const options = pollData?.options || [];
                  
                  // Get voters from pollUpdates
                  for (const pollUpdate of update.pollUpdates) {
                    if (pollUpdate.vote?.selectedOptions?.length > 0) {
                      const selectedHashes: string[] = [];
                      for (const opt of pollUpdate.vote.selectedOptions) {
                        if (opt) {
                          const hashHex = Buffer.isBuffer(opt) ? opt.toString('hex') : 
                                         (opt instanceof Uint8Array ? Buffer.from(opt).toString('hex') : String(opt));
                          selectedHashes.push(hashHex);
                        }
                      }
                      
                      // Match hash to option
                      for (const optionName of options) {
                        const optionHash = this.hashPollOption(optionName);
                        if (selectedHashes.some(h => h === optionHash)) {
                          let payload = {
                            ...message[0],
                            body: optionName,
                            from: utils.formatPhone(key.remoteJid, this.plugin),
                            type: "poll",
                          };
                          
                          console.log(`✅ EMITTING poll response (hash fallback) - from: ${payload.from}, body: "${payload.body}"`);
                          this.emit("message", payload);
                          return;
                        }
                      }
                    }
                  }
                } else {
                  console.log(`⚠️ Poll message not found in cache for ID: ${key.id}`);
                }
              }
            } catch (error) {
              console.error(`❌ Error processing poll update:`, error);
            }
          }
        }
      },
    },
  ];

  initBusEvents = (_sock: any): void => {
    this.vendor = _sock;
    const listEvents = this.busEvents();

    for (const { event, func } of listEvents) {
      this.vendor.ev.on(event, func);
    }
  };

  /**
   * Send Media
   * @alpha
   * @param {string} number
   * @param {string} message
   * @example await sendMessage('+XXXXXXXXXXX', 'https://dominio.com/imagen.jpg' | 'img/imagen.jpg')
   */

  sendMedia = async (
    number: string,
    mediaUrl: string,
    text: string
  ): Promise<any> => {
    try {
      const fileDownloaded = await utils.generalDownload(mediaUrl);
      const mimeType = mime.lookup(fileDownloaded);

      if (typeof mimeType === "string" && mimeType.includes("image"))
        return this.sendImage(number, fileDownloaded, text);
      if (typeof mimeType === "string" && mimeType.includes("video"))
        return this.sendVideo(number, fileDownloaded, text);
      if (typeof mimeType === "string" && mimeType.includes("audio")) {
        const fileOpus = await utils.convertAudio(fileDownloaded);
        return this.sendAudio(number, fileOpus);
      }

      return this.sendFile(number, fileDownloaded);
    } catch (error) {
      console.error(`Error enviando media: ${error}`);
      throw error;
    }
  };

  /**
   * Send image
   * @param {*} number
   * @param {*} filePath
   * @param {*} text
   * @returns
   */
  sendImage = async (
    number: string,
    filePath: string,
    text: string
  ): Promise<any> => {
    const numberClean = utils.formatPhone(number);
    return this.vendor.sendMessage(numberClean, {
      image: readFileSync(filePath),
      caption: text ?? "",
    });
  };

  /**
   * Enviar video
   * @param {*} number
   * @param {*} imageUrl
   * @param {*} text
   * @returns
   */
  sendVideo = async (
    number: string,
    filePath: string,
    text: string
  ): Promise<any> => {
    const numberClean = utils.formatPhone(number);
    return this.vendor.sendMessage(numberClean, {
      video: readFileSync(filePath),
      caption: text,
      gifPlayback: this.globalVendorArgs.gifPlayback,
    });
  };

  /**
   * Enviar audio
   * @alpha
   * @param {string} number
   * @param {string} message
   * @param {boolean} voiceNote optional
   * @example await sendMessage('+XXXXXXXXXXX', 'audio.mp3')
   */

  sendAudio = async (number: string, audioUrl: string): Promise<any> => {
    const numberClean = utils.formatPhone(number);
    return this.vendor.sendMessage(numberClean, {
      audio: { url: audioUrl },
      ptt: true,
    });
  };

  /**
   *
   * @param {string} number
   * @param {string} message
   * @returns
   */
  sendText = async (number: string, message: string, retries = 3): Promise<any> => {
    // Validate connection state before sending
    if (!this.vendor) {
      console.error('Bot not connected. Skipping message send.');
      return null;
    }

    const numberClean = utils.formatPhone(number);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.vendor.sendMessage(numberClean, { text: message });
      } catch (error: any) {
        const errorMsg = error?.message || error?.toString() || 'Unknown error';
        console.error(`[${attempt}/${retries}] Send text failed to ${numberClean}: ${errorMsg}`);
        
        // Don't retry on certain errors
        if (errorMsg.includes('Timed Out') || errorMsg.includes('closed') || errorMsg.includes('Session')) {
          console.error('Non-retryable error detected. Aborting send.');
          return null;
        }
        
        if (attempt === retries) {
          console.error(`Failed to send message after ${retries} attempts. Giving up.`);
          return null; // Return null instead of throwing to prevent crash
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 1500));
      }
    }
  };

  /**
   *
   * @param {string} number
   * @param {string} filePath
   * @example await sendMessage('+XXXXXXXXXXX', './document/file.pdf')
   */

  sendFile = async (number: string, filePath: string): Promise<any> => {
    const numberClean = utils.formatPhone(number);
    const mimeType = mime.lookup(filePath);
    const fileName = filePath.split("/").pop();
    return this.vendor.sendMessage(numberClean, {
      document: { url: filePath },
      mimetype: mimeType,
      fileName: fileName,
    });
  };

  /**
   * @deprecated
   * @param {string} number
   * @param {string} text
   * @param {string} footer
   * @param {Array} buttons
   * @example await sendMessage("+XXXXXXXXXXX", "Your Text", "Your Footer", [{"buttonId": "id", "buttonText": {"displayText": "Button"}, "type": 1}])
   */

  sendButtons = async (
    number: string,
    text: string,
    footer: string = "",
    buttons: any[]
  ): Promise<any> => {
    const numberClean = utils.formatPhone(number);

    const templateButtons = buttons.map((btn, i) => ({
      buttonId: `id-btn-${i}`, // Create a unique button ID for each button
      buttonText: { displayText: btn.body },
      type: 1,
    }));

    const buttonMessage = {
      text,
      footer,
      buttons: templateButtons,
      headerType: 1,
    };

    return this.vendor.sendMessage(numberClean, buttonMessage);
  };

  /**
   *
   * @param {string} number
   * @param {string} text
   * @param {string} footer
   * @param {Array} poll
   * @example await sendMessage("+XXXXXXXXXXX", "Your Text", "Your Footer", [{"buttonId": "id", "buttonText": {"displayText": "Button"}, "type": 1}])
   */

  sendPoll = async (
    number: string,
    text: string,
    poll: any,
    retries = 3
  ): Promise<any> => {
    // Validate connection state before sending
    if (!this.vendor) {
      console.error('Bot not connected. Skipping poll send.');
      return false;
    }

    const numberClean = utils.formatPhone(number);

    if (poll.options.length < 2) return false;

    const pollMessage = {
      name: text,
      values: poll.options,
      selectableCount: 1,
    };
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await this.vendor.sendMessage(numberClean, { poll: pollMessage });
        
        // Store poll creation message WITH OPTIONS for later decoding poll responses
        if (result?.key?.id) {
          console.log(`📊 Poll sent - storing message for ID: ${result.key.id}`);
          console.log(`   Options stored: ${poll.options.join(', ')}`);
          
          // Create proper pollCreationMessage structure for getAggregateVotesInPollMessage
          const pollCreationMessage = {
            pollCreationMessage: {
              name: text,
              options: poll.options.map((opt: string) => ({ optionName: opt })),
              selectableOptionsCount: 1
            }
          };
          
          this.pollMessages.set(result.key.id, {
            message: pollCreationMessage,
            options: poll.options  // Store the original options for hash matching
          });
          
          // Also store in the in-memory store if available
          if (this.store) {
            // Bind the message to store manually
            this.store.messages[numberClean] = this.store.messages[numberClean] || [];
          }
          
          // Clean up old poll messages after 24 hours
          setTimeout(() => {
            this.pollMessages.delete(result.key.id);
          }, 24 * 60 * 60 * 1000);
        }
        
        return result;
      } catch (error: any) {
        const errorMsg = error?.message || error?.toString() || 'Unknown error';
        console.error(`[${attempt}/${retries}] Send poll failed to ${numberClean}: ${errorMsg}`);
        
        // Don't retry on certain errors
        if (errorMsg.includes('Timed Out') || errorMsg.includes('closed') || errorMsg.includes('Session')) {
          console.error('Non-retryable error detected. Aborting poll send.');
          return false;
        }
        
        if (attempt === retries) {
          console.error(`Failed to send poll after ${retries} attempts. Giving up.`);
          return false;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 1500));
      }
    }
    return false;
  };

  /**
   * @param {string} number
   * @param {string} message
   * @example await sendMessage('+XXXXXXXXXXX', 'Hello World')
   */

  sendMessage = async (
    numberIn: string,
    message: string,
    options: SendMessageOptions
  ): Promise<any> => {
    const number = utils.formatPhone(numberIn);

    if (options.options.buttons?.length) {
      return this.sendPoll(number, message, {
        options: options.options.buttons.map((btn, i) => btn.body) ?? [],
      });
    }
    if (options.options?.media)
      return this.sendMedia(number, options.options.media, message);
    return this.sendText(number, message);
  };

  /**
   * @param {string} remoteJid
   * @param {string} latitude
   * @param {string} longitude
   * @param {any} messages
   * @example await sendLocation("xxxxxxxxxxx@c.us" || "xxxxxxxxxxxxxxxxxx@g.us", "xx.xxxx", "xx.xxxx", messages)
   */

  sendLocation = async (
    remoteJid: string,
    latitude: string,
    longitude: string,
    messages: any = null
  ): Promise<{ status: string }> => {
    await this.vendor.sendMessage(
      remoteJid,
      {
        location: {
          degreesLatitude: latitude,
          degreesLongitude: longitude,
        },
      },
      { quoted: messages }
    );

    return { status: "success" };
  };

  /**
   * @param {string} remoteJid
   * @param {string} contactNumber
   * @param {string} displayName
   * @param {any} messages - optional
   * @example await sendContact("xxxxxxxxxxx@c.us" || "xxxxxxxxxxxxxxxxxx@g.us", "+xxxxxxxxxxx", "Robin Smith", messages)
   */

  sendContact = async (
    remoteJid: string,
    contactNumber: string,
    displayName: string,
    messages: any = null
  ): Promise<{ status: string }> => {
    const cleanContactNumber = contactNumber.replace(/ /g, "");
    const waid = cleanContactNumber.replace("+", "");

    const vcard =
      "BEGIN:VCARD\n" +
      "VERSION:3.0\n" +
      `FN:${displayName}\n` +
      "ORG:Ashoka Uni;\n" +
      `TEL;type=CELL;type=VOICE;waid=${waid}:${cleanContactNumber}\n` +
      "END:VCARD";

    await this.vendor.sendMessage(
      remoteJid,
      {
        contacts: {
          displayName: displayName,
          contacts: [{ vcard }],
        },
      },
      { quoted: messages }
    );

    return { status: "success" };
  };

  /**
   * @param {string} remoteJid
   * @param {string} WAPresence
   * @example await sendPresenceUpdate("xxxxxxxxxxx@c.us" || "xxxxxxxxxxxxxxxxxx@g.us", "recording")
   */
  sendPresenceUpdate = async (
    remoteJid: string,
    WAPresence: string
  ): Promise<void> => {
    await this.vendor.sendPresenceUpdate(WAPresence, remoteJid);
  };

  /**
   * @param {string} remoteJid
   * @param {string} url
   * @param {object} stickerOptions
   * @param {any} messages - optional
   * @example await sendSticker("xxxxxxxxxxx@c.us" || "xxxxxxxxxxxxxxxxxx@g.us", "https://dn/image.png" || "https://dn/image.gif" || "https://dn/image.mp4", {pack: 'User', author: 'Me'}, messages)
   */

  sendSticker = async (
    remoteJid: string,
    url: string,
    stickerOptions: any,
    messages: any = null
  ): Promise<void> => {
    const number = utils.formatPhone(remoteJid);
    const fileDownloaded = await utils.generalDownload(url);

    await this.vendor.sendMessage(
      number,
      {
        sticker: {
          url: fileDownloaded,
        },
      },
      { quoted: messages }
    );
  };
}
