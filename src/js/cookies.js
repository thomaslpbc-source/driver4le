const COOKIE_CONSENT_KEY = 'driver4le:ad-consent';

function getConsent() {
    return localStorage.getItem(COOKIE_CONSENT_KEY);
}

function setConsent(value) {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
}

function hideCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) {
        banner.hidden = true;
    }
}

function showCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) {
        banner.hidden = false;
    }
}

function loadAnalytics(personalized = true) {
    if (window.driver4leAnalyticsLoaded) return;
    window.driver4leAnalyticsLoaded = true;

    // Remplace par ton vrai ID GA4 quand tu l'auras.
    const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

    if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
        return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
        window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());

    gtag('consent', 'default', {
        analytics_storage: personalized ? 'granted' : 'denied',
        ad_storage: personalized ? 'granted' : 'denied',
        ad_user_data: personalized ? 'granted' : 'denied',
        ad_personalization: personalized ? 'granted' : 'denied'
    });

    gtag('config', GA_MEASUREMENT_ID, {
        anonymize_ip: true
    });
}

function loadAdSense({ personalized = true } = {}) {
    if (window.driver4leAdsenseLoaded) return;
    window.driver4leAdsenseLoaded = true;

    // Remplace par ton vrai Publisher ID AdSense quand tu l'auras.
    const ADSENSE_CLIENT_ID = 'ca-pub-XXXXXXXXXXXXXXXX';

    if (ADSENSE_CLIENT_ID === 'ca-pub-XXXXXXXXXXXXXXXX') {
        return;
    }

    window.adsbygoogle = window.adsbygoogle || [];

    // On met d'abord les requêtes en pause, le temps de fixer le mode.
    window.adsbygoogle.pauseAdRequests = 1;

    if (!personalized) {
        window.adsbygoogle.requestNonPersonalizedAds = 1;
    } else {
        window.adsbygoogle.requestNonPersonalizedAds = 0;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
        window.adsbygoogle.pauseAdRequests = 0;

        // Auto ads
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({
                google_ad_client: ADSENSE_CLIENT_ID,
                enable_page_level_ads: true
            });
        } catch (e) {
            console.error('Erreur chargement Auto Ads:', e);
        }
    };

    document.head.appendChild(script);
}

function enablePersonalizedMode() {
    loadAnalytics(true);
    loadAdSense({ personalized: true });
}

function enableNonPersonalizedMode() {
    // Analytics désactivé ici par prudence.
    // Si tu veux l'activer sans personnalisation, on peut l'ajuster après.
    loadAdSense({ personalized: false });
}

function applyStoredConsent() {
    const consent = getConsent();

    if (consent === 'personalized') {
        hideCookieBanner();
        enablePersonalizedMode();
        return;
    }

    if (consent === 'non_personalized') {
        hideCookieBanner();
        enableNonPersonalizedMode();
        return;
    }

    showCookieBanner();
}

function acceptPersonalizedAds() {
    setConsent('personalized');
    hideCookieBanner();
    enablePersonalizedMode();
}

function acceptNonPersonalizedAds() {
    setConsent('non_personalized');
    hideCookieBanner();
    enableNonPersonalizedMode();
}

window.acceptPersonalizedAds = acceptPersonalizedAds;
window.acceptNonPersonalizedAds = acceptNonPersonalizedAds;

document.addEventListener('DOMContentLoaded', applyStoredConsent);