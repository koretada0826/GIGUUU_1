<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="TELEMOは、営業電話の架電から商品説明、意向確認まで対応するAI営業支援サービスです。デモ音声をお聴きいただけます。">
  <title>TELEMO｜営業電話を任せるAI営業支援</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://api.fontshare.com">
  <link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./page.css">
</head>
<body>
  <a class="skip-link" href="#main">本文へ移動</a>
  <header class="site-header">
    <div class="container">
      <nav class="nav-shell" aria-label="ページ内の案内">
        <a class="brand" href="#top" aria-label="TELEMOのページ先頭へ">TELEMO</a>
        <div class="nav-links">
          <a href="#listen">音声を聴く</a>
          <a href="#how">進め方</a>
        </div>
        <a class="nav-contact" href="../../index.html#contact">お問い合わせ</a>
      </nav>
    </div>
  </header>

  <main id="main">
    <section class="hero desk" id="top" aria-labelledby="hero-title">
      <div class="container hero-grid">
        <div class="hero-copy">
          <h1 id="hero-title">電話をかける仕事を、<br>TELEMOに。</h1>
          <p class="hero-lead">AIが商品説明から意向確認まで対応する、営業支援サービスです。</p>
          <a class="button button-primary" href="../../index.html#contact">お問い合わせ</a>
        </div>
        <figure class="sample-sheet">
          <figcaption>法人向けのデモ音声</figcaption>
          <div class="sample-sheet-body">
            <h2>回線デモ</h2>
            <div class="waveform" role="img" aria-label="回線デモ音声の波形"></div>
            <audio controls preload="metadata" aria-label="回線デモ音声を再生">
              <source src="./audio/tob_denwa_kaisen.m4a" type="audio/mp4">
              音声を再生できない場合は、<a href="./audio/tob_denwa_kaisen.m4a">音声ファイルを開いてください</a>。
            </audio>
          </div>
        </figure>
      </div>
    </section>

    <section class="stage stage-register" id="how" aria-labelledby="register-title">
      <div class="container">
        <div class="stage-heading">
          <h2 id="register-title">1. 営業リストを登録</h2>
          <p>架電したい相手のリストをTELEMOに登録します。</p>
        </div>
        <div class="register-flow" role="img" aria-label="営業リストをTELEMOに登録する流れ">
          <span>営業リスト</span>
          <span class="register-flow-verb">登録</span>
          <span>TELEMO</span>
        </div>
      </div>
    </section>

    <section class="stage stage-call" id="listen" aria-labelledby="call-title">
      <div class="container call-grid">
        <div class="call-heading">
          <h2 id="call-title">2. TELEMOが架電</h2>
          <p>商品説明や断りへの切り返し、興味の確認まで対応します。話し方はデモ音声でお確かめください。</p>
        </div>
        <div class="audio-index">
          <article class="audio-row">
            <div>
              <h3>デリバリーデモ</h3>
              <p>法人向けの営業音声</p>
            </div>
            <audio controls preload="metadata" aria-label="デリバリーデモ音声を再生">
              <source src="./audio/tob_denwa_delivery.m4a" type="audio/mp4">
              音声を再生できない場合は、<a href="./audio/tob_denwa_delivery.m4a">音声ファイルを開いてください</a>。
            </audio>
          </article>
          <article class="audio-row">
            <div>
              <h3>MAデモ</h3>
              <p>法人向けの営業音声</p>
            </div>
            <audio controls preload="metadata" aria-label="MAデモ音声を再生">
              <source src="./audio/tob_denwa_ma.m4a" type="audio/mp4">
              音声を再生できない場合は、<a href="./audio/tob_denwa_ma.m4a">音声ファイルを開いてください</a>。
            </audio>
          </article>
          <p class="audio-note">回線デモはページ上部で再生できます。</p>
        </div>
      </div>
    </section>

    <section class="stage stage-handoff" aria-labelledby="handoff-title">
      <div class="container handoff-grid">
        <div class="handoff-heading">
          <h2 id="handoff-title">3. 担当者が確認</h2>
          <p>AIだけでは判断が難しい会話は、内容を記録して担当者へ通知します。</p>
        </div>
        <dl class="handoff-ledger">
          <div>
            <dt>通話の経緯</dt>
            <dd>担当者が会話の内容を確認します。</dd>
          </div>
          <div>
            <dt>その後の対応</dt>
            <dd>必要に応じて、担当者が折り返しや回答を行います。</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="contact-close" aria-labelledby="contact-title">
      <div class="container contact-grid">
        <div>
          <h2 id="contact-title">TELEMOの導入について</h2>
          <p>自社の営業に合うか、まずはご相談ください。</p>
        </div>
        <a class="button button-primary" href="../../index.html#contact">お問い合わせ</a>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-inner">
      <a class="footer-brand" href="#top" aria-label="TELEMOのページ先頭へ">TELEMO</a>
      <div class="footer-details">
        <p>提供：GIGUUU株式会社</p>
        <nav aria-label="関連ページ">
          <a href="../../index.html#company">会社情報</a>
          <a href="../../index.html#policy">各種ポリシー</a>
        </nav>
      </div>
    </div>
  </footer>
</body>
</html>
