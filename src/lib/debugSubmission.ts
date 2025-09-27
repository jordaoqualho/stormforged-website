interface FormSubmitConfig {
  endpoint: string;
  subject: string;
  captcha: boolean;
}

interface TriggerConfig {
  timeBased: boolean;
  actionBased: boolean;
  timeThreshold: number;
}

class DebugSubmissionManager {
  private config: FormSubmitConfig;
  private triggerConfig: TriggerConfig;
  private hasSubmitted: boolean = false;
  private sessionKey = "debug_submission_sent";

  constructor() {
    this.config = {
      endpoint: "https://formsubmit.co/jordaoqualho@gmail.com",
      subject: "Fintal App - LocalStorage Debug",
      captcha: false,
    };

    this.triggerConfig = {
      timeBased: true,
      actionBased: true,
      timeThreshold: 1,
    };

    this.checkSession();
  }

  private checkSession(): void {
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      this.hasSubmitted = sessionStorage.getItem(this.sessionKey) === "true";
    }
  }

  private markSubmitted(): void {
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(this.sessionKey, "true");
    }
    this.hasSubmitted = true;
  }

  private getLocalStorageData(): string {
    try {
      if (typeof window === "undefined" || typeof localStorage === "undefined") {
        return JSON.stringify(
          {
            error: "localStorage not available (server-side rendering)",
            message: "Debug submission only works in browser environment",
          },
          null,
          2
        );
      }

      const guildWarStorageKey = "guild-war-storage";
      const guildWarData = localStorage.getItem(guildWarStorageKey);

      if (!guildWarData) {
        return JSON.stringify(
          {
            error: "No guild war data found in localStorage",
            availableKeys: this.getAllLocalStorageKeys(),
          },
          null,
          2
        );
      }

      const parsedData = JSON.parse(guildWarData);

      const formattedData = {
        attacks: parsedData.state?.attacks || [],
        lastUpdated: new Date().toISOString(),
        debugInfo: {
          originalData: parsedData,
          submissionTimestamp: new Date().toISOString(),
          localStorageSize: localStorage.length,
          allKeys: this.getAllLocalStorageKeys(),
        },
      };

      return JSON.stringify(formattedData, null, 2);
    } catch (error) {
      return JSON.stringify(
        {
          error: "Failed to read localStorage",
          details: error instanceof Error ? error.message : "Unknown error",
          availableKeys: this.getAllLocalStorageKeys(),
        },
        null,
        2
      );
    }
  }

  private getAllLocalStorageKeys(): string[] {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return [];
    }

    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }

  private async submitForm(): Promise<void> {
    if (this.hasSubmitted) {
      return;
    }

    try {
      const jsonData = this.getLocalStorageData();

      // First try AJAX with file attachment
      const ajaxSuccess = await this.tryAjaxSubmission(jsonData);

      if (ajaxSuccess) {
        this.markSubmitted();
        return;
      }

      // Fallback: Create hidden form with iframe to avoid new tab
      this.createHiddenFormSubmission(jsonData);
      this.markSubmitted();
    } catch {
      // Silent error handling
    }
  }

  private async tryAjaxSubmission(jsonData: string): Promise<boolean> {
    try {
      const blob = new Blob([jsonData], { type: "application/json" });
      const file = new File([blob], `guild-war-debug-${new Date().toISOString().split("T")[0]}.json`, {
        type: "application/json",
      });

      const formData = new FormData();
      formData.append("_subject", this.config.subject);
      formData.append("_captcha", this.config.captcha.toString());
      formData.append(
        "message",
        `Debug data submitted on ${new Date().toISOString()}. LocalStorage size: ${
          typeof localStorage !== "undefined" ? localStorage.length : 0
        } items.\n\nJSON data attached as file.`
      );

      // Try different file field names that FormSubmit might recognize
      formData.append("file", file);
      formData.append("attachment", file);
      formData.append("json_file", file);
      formData.append("data_file", file);

      const ajaxEndpoint = this.config.endpoint.replace("https://formsubmit.co/", "https://formsubmit.co/ajax/");

      const response = await fetch(ajaxEndpoint, {
        method: "POST",
        body: formData,
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  private createHiddenFormSubmission(jsonData: string): void {
    if (typeof window === "undefined") return;

    // Create hidden iframe to receive form submission
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.name = "hidden_iframe";
    document.body.appendChild(iframe);

    // Create hidden form
    const form = document.createElement("form");
    form.method = "POST";
    form.action = this.config.endpoint;
    form.target = "hidden_iframe";
    form.enctype = "multipart/form-data";
    form.style.display = "none";

    // Create file input with JSON data
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.name = "attachment";

    // Create blob and file
    const blob = new Blob([jsonData], { type: "application/json" });
    const file = new File([blob], `guild-war-debug-${new Date().toISOString().split("T")[0]}.json`, {
      type: "application/json",
    });

    // Create DataTransfer to set file
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    // Add other form fields
    const subjectInput = document.createElement("input");
    subjectInput.type = "hidden";
    subjectInput.name = "_subject";
    subjectInput.value = this.config.subject;

    const captchaInput = document.createElement("input");
    captchaInput.type = "hidden";
    captchaInput.name = "_captcha";
    captchaInput.value = this.config.captcha.toString();

    const messageInput = document.createElement("textarea");
    messageInput.name = "message";
    messageInput.value = `Debug data submitted on ${new Date().toISOString()}. LocalStorage size: ${
      typeof localStorage !== "undefined" ? localStorage.length : 0
    } items.\n\nJSON data attached as file.`;

    // Append all elements to form
    form.appendChild(fileInput);
    form.appendChild(subjectInput);
    form.appendChild(captchaInput);
    form.appendChild(messageInput);
    document.body.appendChild(form);

    // Submit form
    form.submit();

    // Clean up after a delay
    setTimeout(() => {
      document.body.removeChild(form);
      document.body.removeChild(iframe);
    }, 5000);
  }

  public setupTimeTrigger(): void {
    if (!this.triggerConfig.timeBased || this.hasSubmitted) return;

    const timeoutMs = this.triggerConfig.timeThreshold * 60 * 1000;

    setTimeout(async () => {
      await this.submitForm();
    }, timeoutMs);
  }

  public async triggerActionBased(): Promise<void> {
    if (!this.triggerConfig.actionBased || this.hasSubmitted) return;
    await this.submitForm();
  }

  public async manualTrigger(): Promise<void> {
    await this.submitForm();
  }

  public updateTriggerConfig(newConfig: Partial<TriggerConfig>): void {
    this.triggerConfig = { ...this.triggerConfig, ...newConfig };
  }

  public initialize(): void {
    this.setupTimeTrigger();
  }
}

const debugSubmissionManager = new DebugSubmissionManager();

export const initializeDebugSubmission = () => debugSubmissionManager.initialize();
export const triggerDebugSubmission = async () => await debugSubmissionManager.triggerActionBased();
export const manualDebugSubmission = async () => await debugSubmissionManager.manualTrigger();
export const updateDebugConfig = (config: Partial<TriggerConfig>) => debugSubmissionManager.updateTriggerConfig(config);

export default debugSubmissionManager;
