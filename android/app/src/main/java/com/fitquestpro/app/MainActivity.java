package com.fitquestpro.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            // Set native dark background to eliminate white compositor tearing/ghosting during scroll
            int darkBg = android.graphics.Color.parseColor("#09090b");
            this.bridge.getWebView().setBackgroundColor(darkBg);
            getWindow().getDecorView().setBackgroundColor(darkBg);

            // Enable DOM storage, database, and cookies in WebView for reliable Firebase Auth
            WebSettings settings = this.bridge.getWebView().getSettings();
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setJavaScriptCanOpenWindowsAutomatically(true);

            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            cookieManager.setAcceptThirdPartyCookies(this.bridge.getWebView(), true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
