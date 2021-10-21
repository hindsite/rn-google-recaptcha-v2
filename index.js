import React from 'react';
import { WebView } from 'react-native-webview';

const setContentHeightObserverJsCode = `(${String(function () {
    window.setupObservers = function () {
        this.document.body.style.visibility = 'visible';

        const iframes = document.getElementsByTagName('iframe');
        let iframe = iframes[iframes.length - 1];
        if (
            iframe &&
            iframe.parentElement &&
            iframe.parentElement.parentElement
        ) {
            var target = iframe.parentElement.parentElement;
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function () {
                    let contentParams = {
                        height: iframe.clientHeight,
                        visibility: target.style.visibility,
                    };
                    window.ReactNativeWebView.postMessage(
                        `CONTENT_PARAMS:${JSON.stringify(contentParams)}`,
                    );
                });
            });
            observer.observe(target, {
                attributes: true,
                attributeFilter: ['style'],
            });
        }

        window.ReactNativeWebView.postMessage("ready");
    };
    setTimeout(() => window.setupObservers(), 2000);
})})();`;

/**
 *
 * @param {*} onMessage: callback after received response, error of Google captcha or when user cancel
 * @param {*} siteKey: your site key of Google captcha
 * @param {*} style: custom style
 * @param {*} containerStyle: custom style
 * @param {*} url: base url
 * @param {*} languageCode: can be found at https://developers.google.com/recaptcha/docs/language
 */
const GoogleReCaptcha = ({ onMessage, siteKey, style, url, languageCode, containerStyle, ...props }) => {
    const generateTheWebViewContent = siteKey => {
        const originalForm = `<!DOCTYPE html>
			<html>
			<head>
				<meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta http-equiv="X-UA-Compatible" content="ie=edge">
				<script src="https://www.google.com/recaptcha/api.js?hl=${languageCode || 'en'}" async defer></script>
				<script type="text/javascript">
					var onDataCallback = function (response) { 
						window.ReactNativeWebView.postMessage(response) 
					};
					var onDataExpiredCallback = function (error) { 
						window.ReactNativeWebView.postMessage("expired"); 
						setTimeout(() => window.setupObservers(), 1000);
					};
					var onDataErrorCallback = function (error) { 
						window.ReactNativeWebView.postMessage("error"); 
					}
				</script>
                <style>
                    body {
                        visibility:hidden;
                    }
                    #captcha {
                        text-align: center;
                    }
                    .g-recaptcha {
                        display: inline-block;
                    }
                </style>
			</head>
			<body>
				<div id="captcha">
					<div class="g-recaptcha"
						data-sitekey="${siteKey}"
                        data-callback="onDataCallback"
						data-expired-callback="onDataExpiredCallback"
						data-error-callback="onDataErrorCallback"
                    >
					</div>
				</div>
			</body>
			</html>`;
        return originalForm;
    };
    return (
        <WebView
            originWhitelist={['*']}
            mixedContentMode={'always'}
            onMessage={onMessage}
            javaScriptEnabled={true}
            injectedJavaScript={setContentHeightObserverJsCode}
            automaticallyAdjustContentInsets={true}
            style={[{ backgroundColor: 'transparent', width: '100%' }, style]}
            containerStyle={containerStyle}
            source={{
                html: generateTheWebViewContent(siteKey),
                baseUrl: `${url}`,
            }}
            {...props}
        />
    );
};

export default GoogleReCaptcha;