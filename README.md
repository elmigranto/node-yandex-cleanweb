# CleanWeb API is deprecated by Yandex<br/>(service will be shut down at October 1st)

## yandex-cleanweb

[Yandex.CleanWeb](http://api.yandex.ru/cleanweb/) (Captcha & Antispam) Interface for Node.js

    npm install yandex-cleanweb

## How to start?

1. Get API Key from Yandex — http://api.yandex.ru/cleanweb/form.xml;
2. install package;
3. `new CleanWeb(apiKey);`.

## What can it do?

For now, only CAPTCHA API is implemented: you can [ask](http://api.yandex.ru/cleanweb/doc/dg/concepts/get-captcha.xml) Yandex for one and [validate](http://api.yandex.ru/cleanweb/doc/dg/concepts/check-captcha.xml) it later.
Note that each CAPTCHA ID can only be checked once, all further checks will always fail (regardless of answer correctness).
