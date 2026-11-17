.class public Lcom/thiago/xequecombo/MainActivity;
.super Landroid/app/Activity;

.field private web:Landroid/webkit/WebView;

.field public cb:Landroid/webkit/ValueCallback;

.field public pending:Ljava/lang/String;

.method public constructor <init>()V
    .locals 0
    invoke-direct {p0}, Landroid/app/Activity;-><init>()V
    return-void
.end method

.method protected onCreate(Landroid/os/Bundle;)V
    .locals 3
    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V
    new-instance v0, Landroid/webkit/WebView;
    invoke-direct {v0, p0}, Landroid/webkit/WebView;-><init>(Landroid/content/Context;)V
    iput-object v0, p0, Lcom/thiago/xequecombo/MainActivity;->web:Landroid/webkit/WebView;
    invoke-virtual {v0}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;
    move-result-object v1
    const/4 v2, 0x1
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setJavaScriptEnabled(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setDomStorageEnabled(Z)V
    const/4 v2, 0x0
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setMediaPlaybackRequiresUserGesture(Z)V
    new-instance v1, Lcom/thiago/xequecombo/Client;
    invoke-direct {v1}, Lcom/thiago/xequecombo/Client;-><init>()V
    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->setWebViewClient(Landroid/webkit/WebViewClient;)V
    new-instance v1, Lcom/thiago/xequecombo/Bridge;
    invoke-direct {v1, p0}, Lcom/thiago/xequecombo/Bridge;-><init>(Lcom/thiago/xequecombo/MainActivity;)V
    const-string v2, "XCNative"
    invoke-virtual {v0, v1, v2}, Landroid/webkit/WebView;->addJavascriptInterface(Ljava/lang/Object;Ljava/lang/String;)V
    :c_start
    new-instance v1, Lcom/thiago/xequecombo/Chrome;
    invoke-direct {v1, p0}, Lcom/thiago/xequecombo/Chrome;-><init>(Lcom/thiago/xequecombo/MainActivity;)V
    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->setWebChromeClient(Landroid/webkit/WebChromeClient;)V
    :c_end
    .catch Ljava/lang/Throwable; {:c_start .. :c_end} :c_fail
    goto :c_after
    :c_fail
    move-exception v1
    :c_after
    iget-object v0, p0, Lcom/thiago/xequecombo/MainActivity;->web:Landroid/webkit/WebView;
    const v1, -0xeaf2d5
    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->setBackgroundColor(I)V
    const-string v1, "file:///android_asset/index.html"
    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->loadUrl(Ljava/lang/String;)V
    invoke-virtual {p0, v0}, Lcom/thiago/xequecombo/MainActivity;->setContentView(Landroid/view/View;)V
    invoke-virtual {p0}, Lcom/thiago/xequecombo/MainActivity;->getIntent()Landroid/content/Intent;
    move-result-object v0
    invoke-direct {p0, v0}, Lcom/thiago/xequecombo/MainActivity;->grab(Landroid/content/Intent;)V
    return-void
.end method

.method public onBackPressed()V
    .locals 3
    iget-object v0, p0, Lcom/thiago/xequecombo/MainActivity;->web:Landroid/webkit/WebView;
    invoke-virtual {v0}, Landroid/webkit/WebView;->getUrl()Ljava/lang/String;
    move-result-object v1
    if-eqz v1, :exit
    const-string v2, "#in"
    invoke-virtual {v1, v2}, Ljava/lang/String;->endsWith(Ljava/lang/String;)Z
    move-result v1
    if-eqz v1, :exit
    const-string v1, "window.__back&&window.__back()"
    const/4 v2, 0x0
    invoke-virtual {v0, v1, v2}, Landroid/webkit/WebView;->evaluateJavascript(Ljava/lang/String;Landroid/webkit/ValueCallback;)V
    return-void
    :exit
    invoke-super {p0}, Landroid/app/Activity;->onBackPressed()V
    return-void
.end method

.method protected onActivityResult(IILandroid/content/Intent;)V
    .locals 2
    invoke-super {p0, p1, p2, p3}, Landroid/app/Activity;->onActivityResult(IILandroid/content/Intent;)V
    const/16 v0, 0x2a
    if-ne p1, v0, :done
    iget-object v0, p0, Lcom/thiago/xequecombo/MainActivity;->cb:Landroid/webkit/ValueCallback;
    if-eqz v0, :done
    invoke-static {p2, p3}, Landroid/webkit/WebChromeClient$FileChooserParams;->parseResult(ILandroid/content/Intent;)[Landroid/net/Uri;
    move-result-object v1
    invoke-interface {v0, v1}, Landroid/webkit/ValueCallback;->onReceiveValue(Ljava/lang/Object;)V
    const/4 v0, 0x0
    iput-object v0, p0, Lcom/thiago/xequecombo/MainActivity;->cb:Landroid/webkit/ValueCallback;
    :done
    return-void
.end method

.method private grab(Landroid/content/Intent;)V
    .locals 3
    if-eqz p1, :done
    invoke-virtual {p1}, Landroid/content/Intent;->getData()Landroid/net/Uri;
    move-result-object v0
    if-eqz v0, :done
    invoke-virtual {v0}, Landroid/net/Uri;->getScheme()Ljava/lang/String;
    move-result-object v1
    const-string v2, "xequecombo"
    invoke-virtual {v2, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z
    move-result v1
    if-eqz v1, :done
    const-string v1, "t"
    invoke-virtual {v0, v1}, Landroid/net/Uri;->getQueryParameter(Ljava/lang/String;)Ljava/lang/String;
    move-result-object v0
    iput-object v0, p0, Lcom/thiago/xequecombo/MainActivity;->pending:Ljava/lang/String;
    :done
    return-void
.end method

.method protected onNewIntent(Landroid/content/Intent;)V
    .locals 0
    invoke-super {p0, p1}, Landroid/app/Activity;->onNewIntent(Landroid/content/Intent;)V
    invoke-direct {p0, p1}, Lcom/thiago/xequecombo/MainActivity;->grab(Landroid/content/Intent;)V
    return-void
.end method
