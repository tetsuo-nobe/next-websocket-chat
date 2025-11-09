# next-websocket-chat

* バックエンドは、WebSocket API でアクセス可能な基盤モデル
* 下記をバックエンドとして使用する
  - (https://github.com/tetsuo-nobe/next-simple-chat-backend)

* 下記のメッセージを送信すると回答を受信する
    - `{"action": "sendtext", "text": prompt}`
* WebSocket 接続用 URL は、.env に NEXT_PUBLIC_WebSocket_URL で指定する
    -  例: wss://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev
* ページへアクセスの後、右上に [接続中] と表示されれば WebSocket 接続に成功
    - その後、チャットを開始できる


