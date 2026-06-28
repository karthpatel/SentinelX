(() => {
  const STORAGE_KEY = "sentinelx:v1";
  let memoryState = null;
  let storageMode = "local";

  const ASSESSMENT_QUESTIONS = [
    {
      id: "password-length",
      category: "Password habits",
      prompt: "How do you usually create passwords for important accounts?",
      options: [
        {
          label: "I use long, unique passphrases or generated passwords.",
          score: 4,
          recommendation: "Keep using long, unique passwords for every important account.",
        },
        {
          label: "I use passwords that are unique but sometimes short.",
          score: 3,
          recommendation: "Lengthen important passwords to at least 14 characters or use passphrases.",
        },
        {
          label: "I reuse a few familiar passwords with small changes.",
          score: 1,
          recommendation: "Replace reused passwords with unique passwords for each account.",
        },
        {
          label: "I often use simple passwords because they are easy to remember.",
          score: 0,
          recommendation: "Move away from simple passwords and start with unique passphrases.",
        },
      ],
    },
    {
      id: "password-reuse",
      category: "Password habits",
      prompt: "How often do you reuse passwords across websites or apps?",
      options: [
        {
          label: "Never; every account has its own password.",
          score: 4,
          recommendation: "Maintain your no-reuse password habit.",
        },
        {
          label: "Rarely; only for accounts with no sensitive information.",
          score: 3,
          recommendation: "Phase out password reuse completely, even on low-value accounts.",
        },
        {
          label: "Sometimes; I reuse passwords across similar services.",
          score: 1,
          recommendation: "Audit reused passwords and replace them with unique credentials.",
        },
        {
          label: "Often; I use the same password in many places.",
          score: 0,
          recommendation: "Prioritize changing reused passwords on email, banking, and social accounts.",
        },
      ],
    },
    {
      id: "password-manager",
      category: "Password habits",
      prompt: "Do you use a password manager?",
      options: [
        {
          label: "Yes, for nearly all accounts.",
          score: 4,
          recommendation: "Keep your password manager protected with a strong master password.",
        },
        {
          label: "Yes, but only for some accounts.",
          score: 3,
          recommendation: "Move more accounts into your password manager to reduce reuse.",
        },
        {
          label: "No, but I keep passwords in a private note or document.",
          score: 1,
          recommendation: "Move passwords from notes or documents into a reputable password manager.",
        },
        {
          label: "No, I memorize or repeat most passwords.",
          score: 0,
          recommendation: "Start using a password manager to create and store unique passwords.",
        },
      ],
    },
    {
      id: "password-sharing",
      category: "Password habits",
      prompt: "How do you handle password sharing?",
      options: [
        {
          label: "I do not share passwords; I use account sharing features when needed.",
          score: 4,
          recommendation: "Continue using delegated access instead of sharing passwords.",
        },
        {
          label: "I rarely share, and I change the password afterward.",
          score: 3,
          recommendation: "Replace password sharing with built-in family, team, or delegate access.",
        },
        {
          label: "I sometimes send passwords through chat or email.",
          score: 1,
          recommendation: "Stop sending passwords through chat or email; use secure sharing features.",
        },
        {
          label: "I share passwords whenever it is convenient.",
          score: 0,
          recommendation: "Remove shared passwords and create separate accounts wherever possible.",
        },
      ],
    },
    {
      id: "mfa-critical",
      category: "MFA usage",
      prompt: "Which accounts have multi-factor authentication enabled?",
      options: [
        {
          label: "Email, banking, work, cloud, and social accounts.",
          score: 4,
          recommendation: "Keep MFA enabled on all critical accounts.",
        },
        {
          label: "Email and banking, but not every important account.",
          score: 3,
          recommendation: "Enable MFA on work, cloud storage, and social media accounts too.",
        },
        {
          label: "Only one or two accounts.",
          score: 1,
          recommendation: "Enable MFA first on email, financial, and recovery accounts.",
        },
        {
          label: "None or I am not sure.",
          score: 0,
          recommendation: "Turn on MFA for your email account first, then expand to other services.",
        },
      ],
    },
    {
      id: "mfa-method",
      category: "MFA usage",
      prompt: "What MFA method do you mainly use?",
      options: [
        {
          label: "Authenticator app, passkey, or security key.",
          score: 4,
          recommendation: "Keep using phishing-resistant MFA where available.",
        },
        {
          label: "Push notifications with number matching.",
          score: 3,
          recommendation: "Review MFA prompts carefully and approve only sign-ins you started.",
        },
        {
          label: "SMS codes.",
          score: 2,
          recommendation: "Replace SMS MFA with an authenticator app or passkey where possible.",
        },
        {
          label: "I approve prompts quickly or use no MFA.",
          score: 0,
          recommendation: "Use MFA deliberately and never approve prompts you did not initiate.",
        },
      ],
    },
    {
      id: "public-wifi-sensitive",
      category: "Public WiFi habits",
      prompt: "How often do you access sensitive accounts on public WiFi?",
      options: [
        {
          label: "Never; I wait for a trusted network or use mobile data.",
          score: 4,
          recommendation: "Keep avoiding sensitive activity on public WiFi.",
        },
        {
          label: "Only when using a trusted VPN.",
          score: 3,
          recommendation: "Continue using a VPN and avoid sensitive transactions on unknown networks.",
        },
        {
          label: "Sometimes, if the website uses HTTPS.",
          score: 1,
          recommendation: "Avoid sensitive logins on public WiFi unless using a VPN or mobile data.",
        },
        {
          label: "Often; I use whichever WiFi is available.",
          score: 0,
          recommendation: "Stop using open public WiFi for banking, work, email, or shopping logins.",
        },
      ],
    },
    {
      id: "public-wifi-trust",
      category: "Public WiFi habits",
      prompt: "What do you do before joining a public WiFi network?",
      options: [
        {
          label: "I verify the network name and avoid auto-joining open networks.",
          score: 4,
          recommendation: "Keep verifying public network names before connecting.",
        },
        {
          label: "I usually verify the name but sometimes connect quickly.",
          score: 3,
          recommendation: "Turn off auto-join for public networks and confirm names every time.",
        },
        {
          label: "I connect if the name looks official.",
          score: 1,
          recommendation: "Ask staff to confirm network names before connecting.",
        },
        {
          label: "I connect to any free network with good signal.",
          score: 0,
          recommendation: "Disable auto-join and avoid unknown open WiFi networks.",
        },
      ],
    },
    {
      id: "system-updates",
      category: "Software updates",
      prompt: "How quickly do you install operating system updates?",
      options: [
        {
          label: "Automatically or within a few days.",
          score: 4,
          recommendation: "Keep automatic operating system updates enabled.",
        },
        {
          label: "Usually within a couple of weeks.",
          score: 3,
          recommendation: "Install security updates sooner, especially for phones and laptops.",
        },
        {
          label: "Only when I notice repeated reminders.",
          score: 1,
          recommendation: "Schedule a weekly update check for your devices.",
        },
        {
          label: "I delay updates for months.",
          score: 0,
          recommendation: "Enable automatic updates to close known security vulnerabilities.",
        },
      ],
    },
    {
      id: "app-updates",
      category: "Software updates",
      prompt: "How do you handle browser, app, and extension updates?",
      options: [
        {
          label: "Auto-updates are enabled and unused extensions are removed.",
          score: 4,
          recommendation: "Keep auto-updates on and periodically remove unused extensions.",
        },
        {
          label: "Most apps update automatically, but I rarely review extensions.",
          score: 3,
          recommendation: "Review browser extensions and remove anything you no longer need.",
        },
        {
          label: "I update apps manually when something breaks.",
          score: 1,
          recommendation: "Enable automatic browser and app updates.",
        },
        {
          label: "I often ignore app and browser updates.",
          score: 0,
          recommendation: "Update browsers, apps, and extensions to reduce exploit risk.",
        },
      ],
    },
    {
      id: "backup-frequency",
      category: "Backup practices",
      prompt: "How often do you back up important files?",
      options: [
        {
          label: "Automatically and regularly.",
          score: 4,
          recommendation: "Keep automatic backups running for important files.",
        },
        {
          label: "Manually at least once a month.",
          score: 3,
          recommendation: "Move from manual backups to an automatic backup schedule.",
        },
        {
          label: "Only before major changes or device repairs.",
          score: 1,
          recommendation: "Create a recurring backup plan for important files.",
        },
        {
          label: "I do not back up important files.",
          score: 0,
          recommendation: "Set up automatic cloud or external backups as soon as possible.",
        },
      ],
    },
    {
      id: "backup-recovery",
      category: "Backup practices",
      prompt: "Have you tested that your backups can be restored?",
      options: [
        {
          label: "Yes, I have restored files successfully.",
          score: 4,
          recommendation: "Keep testing restores occasionally to confirm backups work.",
        },
        {
          label: "I have checked that files exist but have not restored recently.",
          score: 3,
          recommendation: "Test restoring a file to confirm your backup process works.",
        },
        {
          label: "I am not sure how restoration works.",
          score: 1,
          recommendation: "Learn how to restore files before an emergency happens.",
        },
        {
          label: "No, I do not have usable backups.",
          score: 0,
          recommendation: "Create a backup and test restoring one file from it.",
        },
      ],
    },
    {
      id: "social-privacy",
      category: "Social media privacy",
      prompt: "How private are your social media profiles?",
      options: [
        {
          label: "Restricted to trusted people, with old posts reviewed.",
          score: 4,
          recommendation: "Continue reviewing profile visibility and old posts periodically.",
        },
        {
          label: "Mostly private, but some profile details are public.",
          score: 3,
          recommendation: "Limit public visibility of personal details like birthday and location.",
        },
        {
          label: "Mostly public because I have not changed defaults.",
          score: 1,
          recommendation: "Review privacy settings and restrict who can see posts and profile details.",
        },
        {
          label: "Public, including personal details and location clues.",
          score: 0,
          recommendation: "Reduce public personal information that could help impersonation or scams.",
        },
      ],
    },
    {
      id: "social-sharing",
      category: "Social media privacy",
      prompt: "How careful are you about sharing travel, location, or personal milestones online?",
      options: [
        {
          label: "I avoid real-time location and limit sensitive personal details.",
          score: 4,
          recommendation: "Keep avoiding real-time location and sensitive personal details online.",
        },
        {
          label: "I share sometimes, but usually after the event.",
          score: 3,
          recommendation: "Continue delaying travel or location posts until after events end.",
        },
        {
          label: "I post in real time if the audience seems familiar.",
          score: 1,
          recommendation: "Avoid real-time travel or location posts, even with familiar audiences.",
        },
        {
          label: "I regularly share real-time location or personal details.",
          score: 0,
          recommendation: "Stop posting real-time location details and review who can see your posts.",
        },
      ],
    },
    {
      id: "phishing-awareness",
      category: "Cybersecurity awareness",
      prompt: "What do you do with unexpected links, attachments, or urgent requests?",
      options: [
        {
          label: "I verify the sender and destination before opening or responding.",
          score: 4,
          recommendation: "Keep verifying unexpected links, attachments, and urgent requests.",
        },
        {
          label: "I check suspicious messages, but trusted brands can still fool me.",
          score: 3,
          recommendation: "Check sender domains and navigate directly instead of trusting links.",
        },
        {
          label: "I open links if the message looks professional.",
          score: 1,
          recommendation: "Do not trust appearance alone; inspect links and verify requests directly.",
        },
        {
          label: "I usually click quickly if the message feels urgent.",
          score: 0,
          recommendation: "Pause on urgent messages and verify through a separate trusted channel.",
        },
      ],
    },
  ];

  const URL_SHORTENER_HOSTS = [
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "ow.ly",
    "is.gd",
    "buff.ly",
    "cutt.ly",
    "rebrand.ly",
    "shorturl.at",
    "s.id",
    "rb.gy",
    "lnkd.in",
    "bl.ink",
  ];

  const SUSPICIOUS_URL_KEYWORDS = [
    "login",
    "verify",
    "update",
    "secure",
    "account",
    "password",
    "bank",
    "wallet",
    "free",
    "gift",
    "bonus",
    "prize",
    "claim",
    "urgent",
    "limited",
    "support",
    "signin",
    "confirm",
    "reset",
  ];

  const SCAM_PATTERNS = {
    urgency: [
      "urgent",
      "immediately",
      "act now",
      "limited time",
      "expires",
      "today only",
      "final notice",
      "last chance",
      "suspended",
      "blocked",
      "locked",
      "within 24 hours",
      "avoid penalty",
      "respond now",
    ],
    otp: [
      "otp",
      "one time password",
      "one-time password",
      "verification code",
      "security code",
      "authentication code",
      "6 digit",
      "six digit",
      "share code",
      "send code",
      "provide code",
    ],
    credentials: [
      "password",
      "username",
      "login",
      "sign in",
      "signin",
      "account details",
      "bank details",
      "card number",
      "debit card",
      "credit card",
      "cvv",
      "pin",
      "netbanking",
      "verify your account",
      "update your account",
    ],
    rewards: [
      "congratulations",
      "you won",
      "winner",
      "prize",
      "reward",
      "cashback",
      "gift card",
      "free",
      "lottery",
      "bonus",
      "claim now",
      "selected",
      "exclusive offer",
      "refund approved",
    ],
  };

  function createDefaultState() {
    const now = new Date().toISOString();

    return {
      meta: {
        app: "SentinelX",
        version: 1,
        createdAt: now,
        updatedAt: now,
      },
      workspace: {
        name: "SentinelX Workspace",
        theme: "dark",
        lastVisitedPage: "home",
        lastVisitedAt: now,
      },
      modules: {
        cyberHygiene: {
          score: 0,
          riskLevel: "Not assessed",
          riskTone: "none",
          status: "Assessment not started",
          completedChecks: 0,
          totalChecks: ASSESSMENT_QUESTIONS.length,
          openGaps: ASSESSMENT_QUESTIONS.length,
          trendPercent: 0,
          lastAssessmentAt: null,
          answers: {},
          categoryScores: {},
          recommendations: [],
          history: [],
        },
        urlScans: {
          total: 0,
          safe: 0,
          suspicious: 0,
          malicious: 0,
          lastScanAt: null,
          history: [],
        },
        qrScans: {
          total: 64,
          safe: 51,
          suspicious: 10,
          malicious: 3,
          lastScanAt: now,
          history: [],
        },
        scamAnalysis: {
          total: 0,
          lowRisk: 0,
          mediumRisk: 0,
          highRisk: 0,
          lastAnalysisAt: null,
          history: [],
        },
      },
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function isPlainObject(value) {
    return value && typeof value === "object" && !Array.isArray(value);
  }

  function mergeDefaults(defaultValue, storedValue) {
    if (Array.isArray(defaultValue)) {
      return Array.isArray(storedValue) ? storedValue : clone(defaultValue);
    }

    if (!isPlainObject(defaultValue)) {
      return storedValue === undefined ? defaultValue : storedValue;
    }

    const merged = {};
    const storedObject = isPlainObject(storedValue) ? storedValue : {};

    Object.keys(defaultValue).forEach((key) => {
      merged[key] = mergeDefaults(defaultValue[key], storedObject[key]);
    });

    Object.keys(storedObject).forEach((key) => {
      if (!(key in merged)) {
        merged[key] = storedObject[key];
      }
    });

    return merged;
  }

  function readState() {
    const defaults = createDefaultState();

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return defaults;
      }

      return mergeDefaults(defaults, JSON.parse(raw));
    } catch (error) {
      storageMode = "session";
      return memoryState ? mergeDefaults(defaults, memoryState) : defaults;
    }
  }

  function saveState(state) {
    const nextState = clone(state);
    nextState.meta.updatedAt = new Date().toISOString();

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      storageMode = "local";
    } catch (error) {
      storageMode = "session";
      memoryState = nextState;
    }

    return nextState;
  }

  function initializeState() {
    const state = readState();
    const page = document.body.dataset.page || "home";
    const hygiene = state.modules.cyberHygiene;

    if (
      hygiene.status === "Strong baseline" &&
      !hygiene.lastAssessmentAt &&
      Object.keys(hygiene.answers || {}).length === 0
    ) {
      state.modules.cyberHygiene = createDefaultState().modules.cyberHygiene;
    }

    if (
      state.modules.urlScans.total === 128 &&
      Array.isArray(state.modules.urlScans.history) &&
      state.modules.urlScans.history.length === 0
    ) {
      state.modules.urlScans = createDefaultState().modules.urlScans;
    }

    if (
      state.modules.scamAnalysis.total === 42 &&
      Array.isArray(state.modules.scamAnalysis.history) &&
      state.modules.scamAnalysis.history.length === 0
    ) {
      state.modules.scamAnalysis = createDefaultState().modules.scamAnalysis;
    }

    state.workspace.lastVisitedPage = page;
    state.workspace.lastVisitedAt = new Date().toISOString();

    return saveState(state);
  }

  let state = initializeState();

  window.SentinelXStorage = {
    key: STORAGE_KEY,
    getState() {
      return clone(state);
    },
    setState(nextState) {
      state = saveState(mergeDefaults(createDefaultState(), nextState));
      renderDashboard(state);
      return clone(state);
    },
    updateModule(moduleName, updater) {
      if (!state.modules[moduleName]) {
        state.modules[moduleName] = {};
      }

      const nextModule =
        typeof updater === "function"
          ? updater(clone(state.modules[moduleName]))
          : updater;

      state.modules[moduleName] = {
        ...state.modules[moduleName],
        ...nextModule,
      };
      state = saveState(state);
      renderDashboard(state);
      return clone(state.modules[moduleName]);
    },
    reset() {
      state = saveState(createDefaultState());
      renderDashboard(state);
      return clone(state);
    },
  };

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = String(value);
    }
  }

  function formatNumber(value) {
    return new Intl.NumberFormat().format(Number(value) || 0);
  }

  function formatDate(value, fallback) {
    if (!value) {
      return fallback;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return fallback;
    }

    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function getRiskFromScore(score) {
    if (score >= 80) {
      return {
        level: "Low Risk",
        tone: "low",
        summary:
          "Your cyber hygiene is strong. Keep the habits that protect your accounts and data consistent.",
      };
    }

    if (score >= 55) {
      return {
        level: "Moderate Risk",
        tone: "moderate",
        summary:
          "Your cyber hygiene has a workable base, but several habits are creating avoidable exposure.",
      };
    }

    return {
      level: "High Risk",
      tone: "high",
      summary:
        "Your responses show elevated exposure. Prioritize the recommendations before adding new tools.",
    };
  }

  function getToneFromRisk(riskLevel) {
    if (riskLevel === "Low Risk") return "low";
    if (riskLevel === "Moderate Risk") return "moderate";
    if (riskLevel === "High Risk") return "high";
    return "none";
  }

  function getThreatRiskFromScore(score) {
    if (score <= 30) {
      return {
        level: "Low Risk",
        tone: "low",
        summary:
          "The URL has a low threat score based on the local SentinelX checks.",
      };
    }

    if (score <= 65) {
      return {
        level: "Moderate Risk",
        tone: "moderate",
        summary:
          "The URL contains warning signs. Verify the destination before entering information.",
      };
    }

    return {
      level: "High Risk",
      tone: "high",
      summary:
        "The URL has multiple risky indicators. Avoid opening it unless you can verify the source.",
    };
  }

  function getScamRiskFromScore(score) {
    if (score <= 30) {
      return {
        level: "Low Risk",
        tone: "low",
        summary:
          "This message has a low scam probability based on local SentinelX checks.",
      };
    }

    if (score <= 65) {
      return {
        level: "Moderate Risk",
        tone: "moderate",
        summary:
          "This message has suspicious traits. Verify through an official channel before responding.",
      };
    }

    return {
      level: "High Risk",
      tone: "high",
      summary:
        "This message strongly resembles a scam. Do not click links, share codes, or provide credentials.",
    };
  }

  function findPatternMatches(text, patterns) {
    return patterns.filter((pattern) => text.includes(pattern));
  }

  function extractLinks(text) {
    const urlMatches = text.match(/https?:\/\/[^\s<>"')]+/gi) || [];
    const domainMatches =
      text.match(/\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"')]+)?/gi) || [];

    return Array.from(new Set([...urlMatches, ...domainMatches])).slice(0, 8);
  }

  function analyzeScamMessage(message, messageType) {
    const trimmed = message.trim();
    if (trimmed.length < 12) {
      throw new Error("Paste a longer message before running scam analysis.");
    }

    const lower = trimmed.toLowerCase();
    const links = extractLinks(trimmed);
    const urgencyMatches = findPatternMatches(lower, SCAM_PATTERNS.urgency);
    const otpMatches = findPatternMatches(lower, SCAM_PATTERNS.otp);
    const credentialMatches = findPatternMatches(lower, SCAM_PATTERNS.credentials);
    const rewardMatches = findPatternMatches(lower, SCAM_PATTERNS.rewards);
    const findings = [];
    let score = 0;

    if (urgencyMatches.length > 0) {
      const impact = Math.min(22, urgencyMatches.length * 7);
      score += impact;
      findings.push({
        title: "Urgency language detected",
        tone: impact >= 14 ? "danger" : "warning",
        impact: `+${impact}`,
        explanation: `Found urgency signals: ${urgencyMatches.join(", ")}. Scams often pressure users to act quickly.`,
      });
    } else {
      findings.push({
        title: "No urgency pressure",
        tone: "safe",
        impact: "+0",
        explanation: "No strong urgency or pressure phrases were detected.",
      });
    }

    if (otpMatches.length > 0) {
      const asksToShare = /(share|send|provide|tell|reply|forward).{0,24}(otp|code|password)|(?:otp|code).{0,24}(share|send|provide|reply|forward)/i.test(
        trimmed,
      );
      const impact = asksToShare ? 30 : 20;
      score += impact;
      findings.push({
        title: asksToShare ? "OTP sharing request" : "OTP language detected",
        tone: "danger",
        impact: `+${impact}`,
        explanation:
          "Legitimate services do not ask you to share OTPs or verification codes with another person.",
      });
    } else {
      findings.push({
        title: "No OTP request",
        tone: "safe",
        impact: "+0",
        explanation: "No request for OTPs or verification codes was detected.",
      });
    }

    if (credentialMatches.length > 0) {
      const impact = Math.min(28, 14 + credentialMatches.length * 4);
      score += impact;
      findings.push({
        title: "Credential or financial request",
        tone: "danger",
        impact: `+${impact}`,
        explanation: `Found sensitive account terms: ${credentialMatches.join(", ")}. Requests for login, card, PIN, or account details are high risk.`,
      });
    } else {
      findings.push({
        title: "No credential request",
        tone: "safe",
        impact: "+0",
        explanation: "No direct request for passwords, card details, PINs, or account credentials was detected.",
      });
    }

    if (rewardMatches.length > 0) {
      const impact = Math.min(22, rewardMatches.length * 6);
      score += impact;
      findings.push({
        title: "Reward or prize language",
        tone: impact >= 12 ? "warning" : "safe",
        impact: `+${impact}`,
        explanation: `Found reward signals: ${rewardMatches.join(", ")}. Fake prizes and cashback offers are common scam hooks.`,
      });
    } else {
      findings.push({
        title: "No reward hook",
        tone: "safe",
        impact: "+0",
        explanation: "No obvious prize, reward, cashback, or giveaway hook was detected.",
      });
    }

    if (links.length > 0) {
      let linkImpact = 12;
      const shortenerLinks = links.filter((link) => {
        try {
          const target = link.startsWith("http") ? link : `http://${link}`;
          const host = new URL(target).hostname.replace(/^www\./, "").toLowerCase();
          return URL_SHORTENER_HOSTS.includes(host);
        } catch (error) {
          return false;
        }
      });
      const nonHttpsLinks = links.filter((link) => /^http:\/\//i.test(link));

      if (shortenerLinks.length > 0) linkImpact += 12;
      if (nonHttpsLinks.length > 0) linkImpact += 8;
      linkImpact = Math.min(28, linkImpact);
      score += linkImpact;

      findings.push({
        title: "Suspicious links present",
        tone: linkImpact >= 20 ? "danger" : "warning",
        impact: `+${linkImpact}`,
        explanation: `Detected ${links.length} link(s). Links in unsolicited messages should be verified outside the message before opening.`,
      });
    } else {
      findings.push({
        title: "No links detected",
        tone: "safe",
        impact: "+0",
        explanation: "No clickable links or domain-like strings were detected.",
      });
    }

    const scamScore = Math.min(100, score);
    const risk = getScamRiskFromScore(scamScore);
    const preview = trimmed.replace(/\s+/g, " ").slice(0, 140);

    return {
      id: `scam-${Date.now()}`,
      messageType,
      preview,
      score: scamScore,
      riskLevel: risk.level,
      riskTone: risk.tone,
      summary: risk.summary,
      findings,
      analyzedAt: new Date().toISOString(),
    };
  }

  function normalizeUrlInput(input) {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error("Enter a URL before running analysis.");
    }

    const hasProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
    const parseTarget = hasProtocol ? trimmed : `http://${trimmed}`;
    const parsed = new URL(parseTarget);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Only HTTP and HTTPS URLs can be analyzed.");
    }

    return {
      original: trimmed,
      normalized: parsed.href,
      parsed,
      hasExplicitProtocol: hasProtocol,
    };
  }

  function isIpAddressHost(hostname) {
    const cleanHost = hostname.replace(/^\[|\]$/g, "");
    const ipv4 =
      /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(
        cleanHost,
      );
    const ipv6 = cleanHost.includes(":") && /^[0-9a-f:]+$/i.test(cleanHost);

    return ipv4 || ipv6;
  }

  function getSubdomainCount(hostname) {
    const labels = hostname.toLowerCase().split(".").filter(Boolean);
    const normalizedLabels = labels[0] === "www" ? labels.slice(1) : labels;

    return Math.max(0, normalizedLabels.length - 2);
  }

  function analyzeUrl(rawUrl) {
    const { original, normalized, parsed, hasExplicitProtocol } =
      normalizeUrlInput(rawUrl);
    const hostname = parsed.hostname.toLowerCase();
    const pathText = `${parsed.hostname}${parsed.pathname}${parsed.search}`.toLowerCase();
    const isHttps = parsed.protocol === "https:" && hasExplicitProtocol;
    const urlLength = original.length;
    const matchedKeywords = SUSPICIOUS_URL_KEYWORDS.filter((keyword) =>
      pathText.includes(keyword),
    );
    const isIpHost = isIpAddressHost(hostname);
    const isShortener = URL_SHORTENER_HOSTS.includes(hostname.replace(/^www\./, ""));
    const subdomainCount = getSubdomainCount(hostname);
    const hasExcessiveSubdomains = subdomainCount > 2;
    const findings = [];
    let score = 0;

    if (isHttps) {
      findings.push({
        title: "HTTPS present",
        tone: "safe",
        impact: "+0",
        explanation:
          "The URL explicitly uses HTTPS, which protects traffic in transit.",
      });
    } else {
      score += 25;
      findings.push({
        title: "HTTPS missing",
        tone: "danger",
        impact: "+25",
        explanation:
          "The URL does not explicitly use HTTPS. Avoid entering passwords or sensitive data.",
      });
    }

    if (urlLength > 120) {
      score += 20;
      findings.push({
        title: "Very long URL",
        tone: "warning",
        impact: "+20",
        explanation:
          "Very long URLs can hide redirect chains, tracking payloads, or deceptive destinations.",
      });
    } else if (urlLength > 75) {
      score += 10;
      findings.push({
        title: "Long URL",
        tone: "warning",
        impact: "+10",
        explanation:
          "The URL is longer than usual. Review it carefully before opening.",
      });
    } else {
      findings.push({
        title: "URL length normal",
        tone: "safe",
        impact: "+0",
        explanation: "The URL length is within a typical range.",
      });
    }

    if (matchedKeywords.length > 0) {
      const keywordScore = Math.min(25, matchedKeywords.length * 8);
      score += keywordScore;
      findings.push({
        title: "Suspicious keywords found",
        tone: keywordScore >= 16 ? "danger" : "warning",
        impact: `+${keywordScore}`,
        explanation: `Found: ${matchedKeywords.join(", ")}. These words are common in phishing or scam URLs.`,
      });
    } else {
      findings.push({
        title: "No suspicious keywords",
        tone: "safe",
        impact: "+0",
        explanation: "No common phishing or urgency keywords were detected.",
      });
    }

    if (isIpHost) {
      score += 25;
      findings.push({
        title: "IP address host",
        tone: "danger",
        impact: "+25",
        explanation:
          "The URL uses a raw IP address instead of a domain name, which is common in suspicious links.",
      });
    } else {
      findings.push({
        title: "Domain host",
        tone: "safe",
        impact: "+0",
        explanation: "The URL uses a domain name rather than a raw IP address.",
      });
    }

    if (isShortener) {
      score += 18;
      findings.push({
        title: "URL shortener detected",
        tone: "warning",
        impact: "+18",
        explanation:
          "Shortened URLs hide the final destination. Open only if you trust the sender.",
      });
    } else {
      findings.push({
        title: "No known shortener",
        tone: "safe",
        impact: "+0",
        explanation: "The domain is not in SentinelX's local shortener list.",
      });
    }

    if (hasExcessiveSubdomains) {
      score += 15;
      findings.push({
        title: "Excessive subdomains",
        tone: "warning",
        impact: "+15",
        explanation: `Detected ${subdomainCount} subdomains. Attackers sometimes use deep subdomains to imitate trusted brands.`,
      });
    } else {
      findings.push({
        title: "Subdomain depth normal",
        tone: "safe",
        impact: "+0",
        explanation: "The URL does not use excessive subdomain nesting.",
      });
    }

    const threatScore = Math.min(100, score);
    const risk = getThreatRiskFromScore(threatScore);

    return {
      id: `url-${Date.now()}`,
      url: original,
      normalizedUrl: normalized,
      hostname,
      score: threatScore,
      riskLevel: risk.level,
      riskTone: risk.tone,
      summary: risk.summary,
      findings,
      scannedAt: new Date().toISOString(),
    };
  }

  function calculateAssessment(answers) {
    let earned = 0;
    let max = 0;
    const recommendations = [];
    const categoryScores = {};

    ASSESSMENT_QUESTIONS.forEach((question) => {
      const selectedIndex = Number(answers[question.id]);
      const selectedOption = question.options[selectedIndex];
      const score = selectedOption ? selectedOption.score : 0;

      earned += score;
      max += 4;

      if (!categoryScores[question.category]) {
        categoryScores[question.category] = {
          earned: 0,
          max: 0,
          percent: 0,
        };
      }

      categoryScores[question.category].earned += score;
      categoryScores[question.category].max += 4;

      if (selectedOption && selectedOption.score < 4) {
        recommendations.push(selectedOption.recommendation);
      }
    });

    Object.keys(categoryScores).forEach((category) => {
      const item = categoryScores[category];
      item.percent = Math.round((item.earned / item.max) * 100);
    });

    const score = Math.round((earned / max) * 100);
    const risk = getRiskFromScore(score);
    const uniqueRecommendations = Array.from(new Set(recommendations));

    return {
      score,
      riskLevel: risk.level,
      riskTone: risk.tone,
      summary: risk.summary,
      categoryScores,
      recommendations:
        uniqueRecommendations.length > 0
          ? uniqueRecommendations.slice(0, 8)
          : ["Maintain your current cyber hygiene habits and reassess regularly."],
    };
  }

  function setDistribution(prefix, total, values) {
    const safeWidth = total > 0 ? (values[0] / total) * 100 : 0;
    const warningWidth = total > 0 ? (values[1] / total) * 100 : 0;
    const dangerWidth = total > 0 ? (values[2] / total) * 100 : 0;

    const safeBar = document.getElementById(`${prefix}-safe-bar`);
    const lowBar = document.getElementById(`${prefix}-low-bar`);
    const warningBar =
      document.getElementById(`${prefix}-suspicious-bar`) ||
      document.getElementById(`${prefix}-medium-bar`);
    const dangerBar =
      document.getElementById(`${prefix}-malicious-bar`) ||
      document.getElementById(`${prefix}-high-bar`);

    if (safeBar) safeBar.style.width = `${safeWidth}%`;
    if (lowBar) lowBar.style.width = `${safeWidth}%`;
    if (warningBar) warningBar.style.width = `${warningWidth}%`;
    if (dangerBar) dangerBar.style.width = `${dangerWidth}%`;
  }

  function renderDashboard(currentState) {
    if (document.body.dataset.page !== "dashboard") {
      return;
    }

    const hygiene = currentState.modules.cyberHygiene;
    const urls = currentState.modules.urlScans;
    const qrs = currentState.modules.qrScans;
    const scams = currentState.modules.scamAnalysis;

    const score = Math.max(0, Math.min(100, Number(hygiene.score) || 0));
    const riskTone = hygiene.riskTone || getToneFromRisk(hygiene.riskLevel);
    const scoreRing = document.querySelector("[data-score-ring]");
    if (scoreRing) {
      scoreRing.style.setProperty("--score", score);
      scoreRing.dataset.riskTone = riskTone;
    }

    setText("hygiene-score", score);
    setText("hygiene-completed", `${hygiene.completedChecks}/${hygiene.totalChecks}`);
    setText("hygiene-risk", hygiene.riskLevel || "Not assessed");
    setText("hygiene-updated", formatDate(hygiene.lastAssessmentAt, "Pending"));

    const hygieneStatus = document.querySelector("[data-hygiene-status]");
    if (hygieneStatus) {
      hygieneStatus.textContent = hygiene.lastAssessmentAt
        ? `${hygiene.riskLevel} posture`
        : hygiene.status;
    }

    setText("url-total", formatNumber(urls.total));
    setText("url-safe", formatNumber(urls.safe));
    setText("url-suspicious", formatNumber(urls.suspicious));
    setText("url-malicious", formatNumber(urls.malicious));
    setText("url-updated", `Last updated ${formatDate(urls.lastScanAt, "No scan recorded")}`);
    setDistribution("url", urls.total, [urls.safe, urls.suspicious, urls.malicious]);
    renderRecentUrlScans(urls.history || [], "[data-recent-url-scans]", 5);

    setText("qr-total", formatNumber(qrs.total));
    setText("qr-safe", formatNumber(qrs.safe));
    setText("qr-suspicious", formatNumber(qrs.suspicious));
    setText("qr-malicious", formatNumber(qrs.malicious));
    setText("qr-updated", `Last updated ${formatDate(qrs.lastScanAt, "No scan recorded")}`);
    setDistribution("qr", qrs.total, [qrs.safe, qrs.suspicious, qrs.malicious]);

    setText("scam-total", formatNumber(scams.total));
    setText("scam-low", formatNumber(scams.lowRisk));
    setText("scam-medium", formatNumber(scams.mediumRisk));
    setText("scam-high", formatNumber(scams.highRisk));
    setText(
      "scam-updated",
      `Last updated ${formatDate(scams.lastAnalysisAt, "No analysis recorded")}`,
    );
    setDistribution("scam", scams.total, [
      scams.lowRisk,
      scams.mediumRisk,
      scams.highRisk,
    ]);
    renderRecentScamAnalyses(scams.history || [], "[data-recent-scam-analyses]", 5);

    const storageStatus = document.querySelector("[data-storage-status]");
    if (storageStatus) {
      storageStatus.lastChild.textContent = storageMode === "local" ? "Ready" : "Ready";
    }
  }

  function createRecentScanItem(scan) {
    const item = document.createElement("article");
    item.className = "recent-scan-item";

    const copy = document.createElement("div");
    copy.className = "recent-scan-url";

    const title = document.createElement("strong");
    title.textContent = scan.url;

    const meta = document.createElement("div");
    meta.className = "recent-scan-meta";

    const risk = document.createElement("span");
    risk.textContent = scan.riskLevel;

    const time = document.createElement("span");
    time.textContent = formatDate(scan.scannedAt, "Unknown time");

    meta.append(risk, time);
    copy.append(title, meta);

    const score = document.createElement("span");
    score.className = "scan-score-pill";
    score.dataset.riskTone = scan.riskTone || getToneFromRisk(scan.riskLevel);
    score.textContent = `${scan.score}/100`;

    item.append(copy, score);
    return item;
  }

  function createRecentScamItem(analysis) {
    const item = document.createElement("article");
    item.className = "recent-scan-item";

    const copy = document.createElement("div");
    copy.className = "recent-scan-url";

    const title = document.createElement("strong");
    title.textContent = `${analysis.messageType} analysis`;

    const preview = document.createElement("p");
    preview.textContent = analysis.preview;

    const meta = document.createElement("div");
    meta.className = "recent-scan-meta";

    const risk = document.createElement("span");
    risk.textContent = analysis.riskLevel;

    const time = document.createElement("span");
    time.textContent = formatDate(analysis.analyzedAt, "Unknown time");

    meta.append(risk, time);
    copy.append(title, preview, meta);

    const score = document.createElement("span");
    score.className = "scan-score-pill";
    score.dataset.riskTone = analysis.riskTone || getToneFromRisk(analysis.riskLevel);
    score.textContent = `${analysis.score}/100`;

    item.append(copy, score);
    return item;
  }

  function renderRecentUrlScans(history, selector, limit = 5) {
    const container = document.querySelector(selector);
    if (!container) {
      return;
    }

    container.replaceChildren();

    if (!history.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No URL scans yet.";
      container.appendChild(empty);
      return;
    }

    history.slice(0, limit).forEach((scan) => {
      container.appendChild(createRecentScanItem(scan));
    });
  }

  function renderRecentScamAnalyses(history, selector, limit = 5) {
    const container = document.querySelector(selector);
    if (!container) {
      return;
    }

    container.replaceChildren();

    if (!history.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No scam analyses yet.";
      container.appendChild(empty);
      return;
    }

    history.slice(0, limit).forEach((analysis) => {
      container.appendChild(createRecentScamItem(analysis));
    });
  }

  function renderUrlAnalyzerResult(scan) {
    const score = document.querySelector("[data-url-score]");
    const risk = document.querySelector("[data-url-risk]");
    const summary = document.querySelector("[data-url-summary]");
    const findings = document.querySelector("[data-url-findings]");

    if (score) score.textContent = String(scan.score);
    if (risk) {
      risk.textContent = scan.riskLevel;
      risk.dataset.riskTone = scan.riskTone;
    }
    if (summary) summary.textContent = scan.summary;

    if (findings) {
      findings.replaceChildren();

      scan.findings.forEach((finding) => {
        const item = document.createElement("article");
        item.className = "finding-item";
        item.dataset.findingTone = finding.tone;

        const title = document.createElement("strong");
        title.textContent = finding.title;

        const explanation = document.createElement("p");
        explanation.textContent = finding.explanation;

        const meta = document.createElement("div");
        meta.className = "finding-meta";

        const impact = document.createElement("span");
        impact.textContent = `Threat impact ${finding.impact}`;

        meta.appendChild(impact);
        item.append(title, explanation, meta);
        findings.appendChild(item);
      });
    }
  }

  function updateUrlScanStats(scan) {
    const previousHistory = Array.isArray(state.modules.urlScans.history)
      ? state.modules.urlScans.history
      : [];
    const history = [scan, ...previousHistory].slice(0, 25);

    state.modules.urlScans = {
      ...state.modules.urlScans,
      total: history.length,
      safe: history.filter((item) => item.riskLevel === "Low Risk").length,
      suspicious: history.filter((item) => item.riskLevel === "Moderate Risk").length,
      malicious: history.filter((item) => item.riskLevel === "High Risk").length,
      lastScanAt: scan.scannedAt,
      history,
    };

    state = saveState(state);
  }

  function renderScamAnalyzerResult(analysis) {
    const score = document.querySelector("[data-scam-score]");
    const risk = document.querySelector("[data-scam-risk]");
    const summary = document.querySelector("[data-scam-summary]");
    const findings = document.querySelector("[data-scam-findings]");

    if (score) score.textContent = String(analysis.score);
    if (risk) {
      risk.textContent = analysis.riskLevel;
      risk.dataset.riskTone = analysis.riskTone;
    }
    if (summary) summary.textContent = analysis.summary;

    if (findings) {
      findings.replaceChildren();

      analysis.findings.forEach((finding) => {
        const item = document.createElement("article");
        item.className = "finding-item";
        item.dataset.findingTone = finding.tone;

        const title = document.createElement("strong");
        title.textContent = finding.title;

        const explanation = document.createElement("p");
        explanation.textContent = finding.explanation;

        const meta = document.createElement("div");
        meta.className = "finding-meta";

        const impact = document.createElement("span");
        impact.textContent = `Scam impact ${finding.impact}`;

        meta.appendChild(impact);
        item.append(title, explanation, meta);
        findings.appendChild(item);
      });
    }
  }

  function updateScamAnalysisStats(analysis) {
    const previousHistory = Array.isArray(state.modules.scamAnalysis.history)
      ? state.modules.scamAnalysis.history
      : [];
    const history = [analysis, ...previousHistory].slice(0, 25);

    state.modules.scamAnalysis = {
      ...state.modules.scamAnalysis,
      total: history.length,
      lowRisk: history.filter((item) => item.riskLevel === "Low Risk").length,
      mediumRisk: history.filter((item) => item.riskLevel === "Moderate Risk").length,
      highRisk: history.filter((item) => item.riskLevel === "High Risk").length,
      lastAnalysisAt: analysis.analyzedAt,
      history,
    };

    state = saveState(state);
  }

  function setupScamAnalyzer() {
    if (document.body.dataset.page !== "scam-analyzer") {
      return;
    }

    const form = document.querySelector("[data-scam-analyzer-form]");
    const input = document.querySelector("[data-scam-input]");
    const typeSelect = document.querySelector("[data-scam-type]");
    const alert = document.querySelector("[data-scam-alert]");

    renderRecentScamAnalyses(state.modules.scamAnalysis.history || [], "[data-scam-history]", 6);

    if (!form || !input || !typeSelect) {
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      try {
        const analysis = analyzeScamMessage(input.value, typeSelect.value);
        updateScamAnalysisStats(analysis);
        renderScamAnalyzerResult(analysis);
        renderRecentScamAnalyses(
          state.modules.scamAnalysis.history || [],
          "[data-scam-history]",
          6,
        );

        if (alert) {
          alert.hidden = true;
        }
      } catch (error) {
        if (alert) {
          alert.textContent = error.message || "Unable to analyze this message.";
          alert.hidden = false;
        }
      }
    });
  }

  function setupUrlAnalyzer() {
    if (document.body.dataset.page !== "url-analyzer") {
      return;
    }

    const form = document.querySelector("[data-url-analyzer-form]");
    const input = document.querySelector("[data-url-input]");
    const alert = document.querySelector("[data-url-alert]");

    renderRecentUrlScans(state.modules.urlScans.history || [], "[data-url-history]", 6);

    if (!form || !input) {
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      try {
        const scan = analyzeUrl(input.value);
        updateUrlScanStats(scan);
        renderUrlAnalyzerResult(scan);
        renderRecentUrlScans(state.modules.urlScans.history || [], "[data-url-history]", 6);

        if (alert) {
          alert.hidden = true;
        }
      } catch (error) {
        if (alert) {
          alert.textContent = error.message || "Unable to analyze this URL.";
          alert.hidden = false;
        }
      }
    });
  }

  function renderAssessmentResult(currentState) {
    if (document.body.dataset.page !== "assessment") {
      return;
    }

    const hygiene = currentState.modules.cyberHygiene;
    const hasResult = Boolean(hygiene.lastAssessmentAt);
    const riskTone = hasResult
      ? hygiene.riskTone || getToneFromRisk(hygiene.riskLevel)
      : "none";
    const resultScore = document.querySelector("[data-result-score]");
    const resultRisk = document.querySelector("[data-result-risk]");
    const resultSummary = document.querySelector("[data-result-summary]");
    const resultRecommendations = document.querySelector("[data-result-recommendations]");

    if (resultScore) {
      resultScore.textContent = String(hygiene.score || 0);
    }

    if (resultRisk) {
      resultRisk.textContent = hasResult ? hygiene.riskLevel : "Not assessed";
      resultRisk.dataset.riskTone = riskTone;
    }

    if (resultSummary) {
      resultSummary.textContent = hasResult
        ? hygiene.status
        : "Complete the assessment to generate your SentinelX cyber hygiene score.";
    }

    if (resultRecommendations) {
      resultRecommendations.replaceChildren();
      const recommendations =
        hasResult && hygiene.recommendations.length
          ? hygiene.recommendations
          : ["Your recommendations will appear after scoring."];

      recommendations.forEach((recommendation) => {
        const item = document.createElement("li");
        item.textContent = recommendation;
        resultRecommendations.appendChild(item);
      });
    }
  }

  function updateAssessmentProgress(form) {
    const answered = ASSESSMENT_QUESTIONS.filter((question) =>
      form.querySelector(`input[name="${question.id}"]:checked`),
    ).length;
    const progress = (answered / ASSESSMENT_QUESTIONS.length) * 100;
    const bar = document.querySelector("[data-assessment-progress-bar]");
    const text = document.querySelector("[data-assessment-progress-text]");

    if (bar) {
      bar.style.width = `${progress}%`;
    }

    if (text) {
      text.textContent = `${answered}/${ASSESSMENT_QUESTIONS.length} answered`;
    }
  }

  function collectAssessmentAnswers(form) {
    const answers = {};
    const missing = [];

    ASSESSMENT_QUESTIONS.forEach((question) => {
      const selected = form.querySelector(`input[name="${question.id}"]:checked`);

      if (!selected) {
        missing.push(question.id);
        return;
      }

      answers[question.id] = Number(selected.value);
    });

    return { answers, missing };
  }

  function renderAssessmentQuestions(form) {
    const container = document.querySelector("[data-assessment-questions]");
    if (!container) {
      return;
    }

    container.replaceChildren();

    ASSESSMENT_QUESTIONS.forEach((question, questionIndex) => {
      const article = document.createElement("article");
      article.className = "question-card";
      article.dataset.questionId = question.id;

      const header = document.createElement("div");
      header.className = "question-header";

      const title = document.createElement("h2");
      title.textContent = `${questionIndex + 1}. ${question.prompt}`;

      const category = document.createElement("span");
      category.textContent = question.category;

      header.append(title, category);
      article.appendChild(header);

      const options = document.createElement("div");
      options.className = "question-options";

      question.options.forEach((option, optionIndex) => {
        const label = document.createElement("label");
        label.className = "question-option";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = question.id;
        input.value = String(optionIndex);

        const savedAnswer = state.modules.cyberHygiene.answers?.[question.id];
        if (Number(savedAnswer) === optionIndex) {
          input.checked = true;
        }

        const control = document.createElement("span");
        control.className = "option-control";
        control.setAttribute("aria-hidden", "true");

        const text = document.createElement("span");
        text.textContent = option.label;

        label.append(input, control, text);
        options.appendChild(label);
      });

      article.appendChild(options);
      container.appendChild(article);
    });

    updateAssessmentProgress(form);
  }

  function setupAssessment() {
    if (document.body.dataset.page !== "assessment") {
      return;
    }

    const form = document.querySelector("[data-assessment-form]");
    const resetButton = document.querySelector("[data-assessment-reset]");
    const alert = document.querySelector("[data-assessment-alert]");

    if (!form) {
      return;
    }

    renderAssessmentQuestions(form);
    renderAssessmentResult(state);

    form.addEventListener("change", (event) => {
      if (event.target.matches('input[type="radio"]')) {
        event.target.closest(".question-card")?.classList.remove("is-missing");
        if (alert) {
          alert.hidden = true;
        }
        updateAssessmentProgress(form);
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const { answers, missing } = collectAssessmentAnswers(form);
      document
        .querySelectorAll(".question-card.is-missing")
        .forEach((card) => card.classList.remove("is-missing"));

      if (missing.length > 0) {
        missing.forEach((questionId) => {
          document
            .querySelector(`[data-question-id="${questionId}"]`)
            ?.classList.add("is-missing");
        });

        if (alert) {
          alert.textContent = `Answer all ${ASSESSMENT_QUESTIONS.length} questions before calculating your score.`;
          alert.hidden = false;
        }

        document
          .querySelector(`[data-question-id="${missing[0]}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const result = calculateAssessment(answers);
      const previousHistory = Array.isArray(state.modules.cyberHygiene.history)
        ? state.modules.cyberHygiene.history
        : [];
      const now = new Date().toISOString();

      state.modules.cyberHygiene = {
        ...state.modules.cyberHygiene,
        score: result.score,
        riskLevel: result.riskLevel,
        riskTone: result.riskTone,
        status: result.summary,
        completedChecks: ASSESSMENT_QUESTIONS.length,
        totalChecks: ASSESSMENT_QUESTIONS.length,
        openGaps: result.recommendations.length,
        trendPercent: 0,
        lastAssessmentAt: now,
        answers,
        categoryScores: result.categoryScores,
        recommendations: result.recommendations,
        history: [
          ...previousHistory,
          {
            score: result.score,
            riskLevel: result.riskLevel,
            completedAt: now,
          },
        ].slice(-10),
      };

      state = saveState(state);
      renderAssessmentResult(state);
      updateAssessmentProgress(form);

      if (alert) {
        alert.hidden = true;
      }

      document
        .querySelector("[data-assessment-result]")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        form.reset();
        document
          .querySelectorAll(".question-card.is-missing")
          .forEach((card) => card.classList.remove("is-missing"));

        if (alert) {
          alert.hidden = true;
        }

        updateAssessmentProgress(form);
      });
    }
  }

  function setupNavigation() {
    const header = document.querySelector("[data-site-header]");
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-primary-nav]");

    function setNavOpen(open) {
      document.body.classList.toggle("nav-open", open);
      if (toggle) {
        toggle.setAttribute("aria-expanded", String(open));
      }
    }

    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        setNavOpen(!document.body.classList.contains("nav-open"));
      });

      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setNavOpen(false));
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          setNavOpen(false);
        }
      });
    }

    function syncHeader() {
      if (header) {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
      }
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
  }

  function animateValue(element, target) {
    const numericTarget = Number(target);
    const duration = 820;
    const start = performance.now();

    if (!Number.isFinite(numericTarget)) {
      element.textContent = target;
      return;
    }

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = formatNumber(Math.round(numericTarget * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  function setupCounters() {
    const counters = Array.from(document.querySelectorAll("[data-counter]"));
    if (!counters.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach((counter) => animateValue(counter, counter.dataset.counter));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const counter = entry.target;
          animateValue(counter, counter.dataset.counter);
          observer.unobserve(counter);
        });
      },
      { threshold: 0.42 },
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function setupThreatCanvas() {
    const canvas = document.querySelector("[data-threat-canvas]");
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, active: false };
    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes = [];

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const nodeCount = Math.max(34, Math.min(72, Math.floor(width / 20)));
      nodes = Array.from({ length: nodeCount }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        radius: 1.4 + Math.random() * 1.8,
        phase: index * 0.37,
      }));
    }

    function drawGrid() {
      context.save();
      context.strokeStyle = "rgba(255, 177, 92, 0.055)";
      context.lineWidth = 1;

      for (let x = 0; x < width; x += 48) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }

      for (let y = 0; y < height; y += 48) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }

      context.restore();
    }

    function updateNodes() {
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      });
    }

    function drawConnections() {
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const first = nodes[i];
          const second = nodes[j];
          const distance = Math.hypot(first.x - second.x, first.y - second.y);

          if (distance > 150) {
            continue;
          }

          context.strokeStyle = `rgba(249, 115, 22, ${0.16 * (1 - distance / 150)})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);
          context.stroke();
        }
      }
    }

    function drawNodes(time) {
      nodes.forEach((node) => {
        const pulse = Math.sin(time * 0.002 + node.phase) * 0.45 + 0.55;
        context.beginPath();
        context.fillStyle = `rgba(255, 177, 92, ${0.4 + pulse * 0.45})`;
        context.arc(node.x, node.y, node.radius + pulse, 0, Math.PI * 2);
        context.fill();
      });
    }

    function drawScanner(time) {
      const scanX = ((time * 0.055) % (width + 320)) - 160;
      const gradient = context.createLinearGradient(scanX - 80, 0, scanX + 80, 0);
      gradient.addColorStop(0, "rgba(249, 115, 22, 0)");
      gradient.addColorStop(0.5, "rgba(249, 115, 22, 0.18)");
      gradient.addColorStop(1, "rgba(249, 115, 22, 0)");

      context.fillStyle = gradient;
      context.fillRect(scanX - 80, 0, 160, height);

      context.strokeStyle = "rgba(255, 177, 92, 0.36)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(scanX, 0);
      context.lineTo(scanX + 90, height);
      context.stroke();
    }

    function drawPointer() {
      if (!pointer.active) {
        return;
      }

      context.save();
      context.strokeStyle = "rgba(255, 177, 92, 0.42)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(pointer.x - 18, pointer.y);
      context.lineTo(pointer.x + 18, pointer.y);
      context.moveTo(pointer.x, pointer.y - 18);
      context.lineTo(pointer.x, pointer.y + 18);
      context.stroke();
      context.restore();
    }

    function draw(time = 0) {
      context.clearRect(0, 0, width, height);
      drawGrid();
      drawScanner(time);
      drawConnections();
      drawNodes(time);
      drawPointer();

      if (!reducedMotion) {
        updateNodes();
        requestAnimationFrame(draw);
      }
    }

    canvas.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    });

    canvas.addEventListener("pointerleave", () => {
      pointer.active = false;
    });

    resize();
    window.addEventListener("resize", resize);
    draw();
  }

  setupNavigation();
  setupCounters();
  setupThreatCanvas();
  setupAssessment();
  setupUrlAnalyzer();
  setupScamAnalyzer();
  renderDashboard(state);
})();
