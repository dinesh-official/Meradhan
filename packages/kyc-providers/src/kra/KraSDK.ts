// kra-sdk.ts
import soap, { Client } from "soap";

/** Allowed environments */
type KraEnvironment = "UAT" | "PROD";

/** KRA SDK configuration options */
export interface KraConfig {
    password: string;
    passKey: string;
    env?: KraEnvironment;
}

/** KRA SDK implementation */
export class KraSDK {
    private password: string;
    private passKey: string;
    private env: KraEnvironment;
    private encryptedPassword: string | null = null;
    private okraClient: Client | null = null;
    private panClient: Client | null = null;

    /** WSDL endpoints */
    private readonly wsdlOkra: string;
    private readonly wsdlPan: string;

    constructor(config: KraConfig) {
        this.password = config.password;
        this.passKey = config.passKey;
        this.env = (config.env || "UAT").toUpperCase() as KraEnvironment;

        this.wsdlOkra =
            this.env === "PROD"
                ? "https://kra.ndml.in/okra-iop/services/OkraServiceImpl/wsdl/OkraServiceImpl.wsdl"
                : "https://pilot.kra.ndml.in/okra-iop/services/OkraServiceImpl/wsdl/OkraServiceImpl.wsdl";

        this.wsdlPan =
            this.env === "PROD"
                ? "https://kra.ndml.in/sms-ws/PANServiceImplService/PANServiceImplService.wsdl"
                : "https://pilot.kra.ndml.in/sms-ws/PANServiceImplService/PANServiceImplService.wsdl";
    }

    /** Initialize clients and fetch encrypted password */
    async init() {
        console.log(`🔧 Initializing NDML KRA SDK (${this.env})...`);
        this.okraClient = await soap.createClientAsync(this.wsdlOkra);
        this.panClient = await soap.createClientAsync(this.wsdlPan);
        this.encryptedPassword = await this.getEncryptedPassword();
        console.log("✅ NDML KRA SDK Initialized");
        return this;
    }

    /** Generate encrypted password */
    private async getEncryptedPassword(): Promise<string> {
        console.log(`CHECK 1`);
        if (!this.okraClient) {
            this.okraClient = await soap.createClientAsync(this.wsdlOkra);
        }
        console.log(`CHECK 2`);
        const [res] = await this.okraClient.getPasswordAsync({
            arg0: this.password,
            arg1: this.passKey,
        });
        console.log(`CHECK 3`);
        const enc = res?.return;
        if (!enc) throw new Error("Failed to get encrypted password");
        console.log("🔐 Encrypted Password Generated");
        return enc;
    }

    /** Ensure password is ready */
    async ensureEncryptedPassword(): Promise<void> {
        if (!this.encryptedPassword) {
            this.encryptedPassword = await this.getEncryptedPassword();
        }
    }





}







const kra = new KraSDK({
    password: "Pass@123",
    passKey: "passkey@456",
    env: "UAT", // or "PROD"
});

const kraProvider = await kra.init();

const token = await kraProvider.ensureEncryptedPassword();
console.log("Encrypted Password:", token);