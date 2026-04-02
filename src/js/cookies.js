const COOKIE_CONSENT_KEY = 'driver4le:ad-consent';
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
const ADSENSE_CLIENT_ID = 'ca-pub-7946180038139939';

function getConsent() {
    return localStorage.getItem(COOKIE_CONSENT_KEY);
}

function setConsent(value) {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
}

function hideCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) banner.hidden = true;
}

function showCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) banner.hidden = false;
}

function loadAnalytics(personalized = true) {
    if (window.driver4leAnalyticsLoaded) return;
    window.driver4leAnalyticsLoaded = true;

    if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;

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

function initializeAdSlots() {
    if (!window.adsbygoogle || !document.querySelector('.js-adsense-slot')) return;

    document.querySelectorAll('.js-adsense-slot').forEach((slot) => {
        if (slot.dataset.adsInitialized === 'true') return;

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            slot.dataset.adsInitialized = 'true';
        } catch (error) {
            console.error('Erreur AdSense:', error);
        }
    });
}

function hideEmptyAds() {
    setTimeout(() => {
        document.querySelectorAll('.adsense-slot').forEach((ad) => {
            const adStatus = ad.getAttribute('data-ad-status');
            const hasContent = ad.innerHTML.trim().length > 0;

            // Supprime si rien n'est affiché ou si AdSense dit explicitement "unfilled"
            if (!hasContent || adStatus === 'unfilled') {
                const section = ad.closest('.ad-section');
                if (section) section.remove();
            }
        });
    }, 3000);
}

function loadAdSense({ personalized = true } = {}) {
    if (ADSENSE_CLIENT_ID === 'ca-pub-XXXXXXXXXXXXXXXX') {
        console.warn('AdSense non configuré');
        hideEmptyAds();
        return;
    }

    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.requestNonPersonalizedAds = personalized ? 0 : 1;

    if (window.driver4leAdsenseLoaded) {
        initializeAdSlots();
        hideEmptyAds();
        return;
    }

    window.driver4leAdsenseLoaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({
                google_ad_client: ADSENSE_CLIENT_ID,
                enable_page_level_ads: true
            });
        } catch (error) {
            console.error('Erreur Auto Ads:', error);
        }

        initializeAdSlots();
        hideEmptyAds();
    };

    script.onerror = () => {
        hideEmptyAds();
    };

    document.head.appendChild(script);

    // Important : couvre aussi les cas où un adblock bloque silencieusement le script
    hideEmptyAds();
}

function enablePersonalizedMode() {
    loadAnalytics(true);
    loadAdSense({ personalized: true });
}

function enableNonPersonalizedMode() {
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