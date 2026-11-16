.class public Lcom/thiago/xequecombo/Chrome;
.super Landroid/webkit/WebChromeClient;

.field private final act:Lcom/thiago/xequecombo/MainActivity;

.method public constructor <init>(Lcom/thiago/xequecombo/MainActivity;)V
    .locals 0
    invoke-direct {p0}, Landroid/webkit/WebChromeClient;-><init>()V
    iput-object p1, p0, Lcom/thiago/xequecombo/Chrome;->act:Lcom/thiago/xequecombo/MainActivity;
    return-void
.end method

.method public onShowFileChooser(Landroid/webkit/WebView;Landroid/webkit/ValueCallback;Landroid/webkit/WebChromeClient$FileChooserParams;)Z
    .locals 3
    iget-object v0, p0, Lcom/thiago/xequecombo/Chrome;->act:Lcom/thiago/xequecombo/MainActivity;
    iget-object v1, v0, Lcom/thiago/xequecombo/MainActivity;->cb:Landroid/webkit/ValueCallback;
    const/4 v2, 0x0
    if-eqz v1, :skip
    invoke-interface {v1, v2}, Landroid/webkit/ValueCallback;->onReceiveValue(Ljava/lang/Object;)V
    :skip
    iput-object p2, v0, Lcom/thiago/xequecombo/MainActivity;->cb:Landroid/webkit/ValueCallback;
    :try_start
    invoke-virtual {p3}, Landroid/webkit/WebChromeClient$FileChooserParams;->createIntent()Landroid/content/Intent;
    move-result-object v1
    const/16 v2, 0x2a
    invoke-virtual {v0, v1, v2}, Lcom/thiago/xequecombo/MainActivity;->startActivityForResult(Landroid/content/Intent;I)V
    :try_end
    .catch Ljava/lang/Exception; {:try_start .. :try_end} :fail
    const/4 v0, 0x1
    return v0
    :fail
    move-exception v1
    iget-object v0, p0, Lcom/thiago/xequecombo/Chrome;->act:Lcom/thiago/xequecombo/MainActivity;
    const/4 v1, 0x0
    iput-object v1, v0, Lcom/thiago/xequecombo/MainActivity;->cb:Landroid/webkit/ValueCallback;
    invoke-interface {p2, v1}, Landroid/webkit/ValueCallback;->onReceiveValue(Ljava/lang/Object;)V
    const/4 v0, 0x1
    return v0
.end method
