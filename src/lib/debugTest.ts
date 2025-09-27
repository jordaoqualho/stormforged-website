import debugSubmissionManager, { manualDebugSubmission, updateDebugConfig } from "./debugSubmission";

declare global {
  interface Window {
    debugTest: {
      manualSubmit: () => void;
      resetSession: () => void;
      updateConfig: (config: any) => void;
      getConfig: () => any;
      testFormSubmit: () => void;
      simulateUsage: () => void;
      getLocalStorageInfo: () => any;
    };
  }
}

const manualSubmit = () => {
  manualDebugSubmission();
};

const resetSession = () => {
  if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem("debug_submission_sent");
  }
};

const updateConfig = (config: any) => {
  updateDebugConfig(config);
};

const getConfig = () => {
  return {
    timeBased: true,
    actionBased: true,
    usageBased: true,
    timeThreshold: 5,
    localStorageThreshold: 10,
  };
};

const testFormSubmit = async () => {
  try {
    let testData;
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      testData = {
        attacks: [],
        lastUpdated: new Date().toISOString(),
        debugInfo: {
          testSubmission: true,
          message: "localStorage not available (server-side rendering)",
          timestamp: new Date().toISOString(),
        },
      };
    } else {
      const guildWarStorageKey = "guild-war-storage";
      const guildWarData = localStorage.getItem(guildWarStorageKey);

      if (guildWarData) {
        const parsedData = JSON.parse(guildWarData);
        testData = {
          attacks: parsedData.state?.attacks || [],
          lastUpdated: new Date().toISOString(),
          debugInfo: {
            testSubmission: true,
            originalData: parsedData,
            submissionTimestamp: new Date().toISOString(),
            localStorageSize: localStorage.length,
            message: "This is a test submission from debugTest utility",
          },
        };
      } else {
        testData = {
          attacks: [],
          lastUpdated: new Date().toISOString(),
          debugInfo: {
            testSubmission: true,
            message: "This is a test submission - no guild war data found",
            localStorageSize: localStorage.length,
            timestamp: new Date().toISOString(),
          },
        };
      }
    }

    const jsonData = JSON.stringify(testData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const file = new File([blob], `debug-test-${new Date().toISOString().split("T")[0]}.json`, {
      type: "application/json",
    });

    // Create FormData for AJAX submission
    const formData = new FormData();
    formData.append("_subject", "Fintal App - Debug Test");
    formData.append("_captcha", "false");
    formData.append(
      "message",
      `Test debug data submitted on ${new Date().toISOString()}.\n\nJSON data attached as file.`
    );

    // Try different file field names that FormSubmit might recognize
    formData.append("file", file);
    formData.append("attachment", file);
    formData.append("json_file", file);
    formData.append("data_file", file);

    // Use AJAX endpoint as per FormSubmit documentation
    const response = await fetch("https://formsubmit.co/ajax/jordaoqualho@gmail.com", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      console.log("Test form submitted successfully");
    }
  } catch {
    // Silent error handling
  }
};

const simulateUsage = () => {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return;
  }

  for (let i = 0; i < 15; i++) {
    localStorage.setItem(
      `debug_test_item_${i}`,
      JSON.stringify({
        test: true,
        index: i,
        timestamp: new Date().toISOString(),
        data: "This is test data to trigger usage-based submission",
      })
    );
  }

  (debugSubmissionManager as any).checkUsageTrigger();
};

const getLocalStorageInfo = () => {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return {
      totalItems: 0,
      keys: [],
      sizeEstimate: 0,
      guildWarData: null,
      error: "localStorage not available (server-side rendering)",
    };
  }

  const info: {
    totalItems: number;
    keys: string[];
    sizeEstimate: number;
    guildWarData: { key: string; size: number; preview: string } | null;
  } = {
    totalItems: localStorage.length,
    keys: [],
    sizeEstimate: 0,
    guildWarData: null,
  };

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      info.keys.push(key);
      info.sizeEstimate += key.length + (value?.length || 0);

      if (key.includes("guild-war") || key.includes("stormforged")) {
        info.guildWarData = {
          key,
          size: value?.length || 0,
          preview: (value?.substring(0, 100) || "") + "...",
        };
      }
    }
  }

  return info;
};

const debugTest = {
  manualSubmit,
  resetSession,
  updateConfig,
  getConfig,
  testFormSubmit,
  simulateUsage,
  getLocalStorageInfo,
};

if (typeof window !== "undefined") {
  window.debugTest = debugTest;
}

export default debugTest;
