# お問い合わせフォームの送信先

サイトの `contact.html` にある `#contactForm` は、専用 Google アカウントの Apps Script Web アプリへ POST します。各ページのフッターやお問い合わせボタンから移動できます。スクリプトは入力内容を `telemo-office@giguuu.jp` にメール送信します。返信先にはフォーム入力者のメールアドレスを設定します。

- Apps Script プロジェクト: https://script.google.com/home/projects/1ilt-qf5lElqsPUIvT91arcGWxDGT29L0fEsqbDQ8u-JfEBMUSt9g7VXp/edit
- Web アプリ URL: https://script.google.com/macros/s/AKfycbzCK7SQe3MKfglaFz-YFDP2pD3V4jWLX-Rw1t4_WD1yVh7bzv1SjM722_u0sbVAj_c/exec
- デプロイ設定: 「次のユーザーとして実行」は自分、「アクセスできるユーザー」は全員

`Code.gs` を変更した場合は、専用アカウントでプロジェクトを開き、コードを保存してから「デプロイ」→「デプロイを管理」→既存デプロイの「編集」→「新バージョン」を選んで更新します。既存デプロイを更新すればフォームの URL は変わりません。

送信完了画面の「サイトに戻る」リンクは、`Code.gs` の `safeReturnUrl_` にある許可ホストだけに表示されます。公開先のドメインが決まったら、必要に応じて許可ホストを更新してください。
