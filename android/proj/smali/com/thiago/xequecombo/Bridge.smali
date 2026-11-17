.class public Lcom/thiago/xequecombo/Bridge;
.super Ljava/lang/Object;

.field private act:Lcom/thiago/xequecombo/MainActivity;

.method public constructor <init>(Lcom/thiago/xequecombo/MainActivity;)V
    .locals 0
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    iput-object p1, p0, Lcom/thiago/xequecombo/Bridge;->act:Lcom/thiago/xequecombo/MainActivity;
    return-void
.end method

.method public take()Ljava/lang/String;
    .locals 3
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation
    iget-object v0, p0, Lcom/thiago/xequecombo/Bridge;->act:Lcom/thiago/xequecombo/MainActivity;
    iget-object v1, v0, Lcom/thiago/xequecombo/MainActivity;->pending:Ljava/lang/String;
    const/4 v2, 0x0
    iput-object v2, v0, Lcom/thiago/xequecombo/MainActivity;->pending:Ljava/lang/String;
    return-object v1
.end method
