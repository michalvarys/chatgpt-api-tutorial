K nastavení dotazu ChatGPT API budeme potřebovat následující 4 kroky 
- Ve VSCode rozšířeních si otevřeme `Thunder Client` a zmáčkneme tlačítko `New Request`
- Nastavíme přístupový bod k API
`POST https://api.openai.com/v1/chat/completions`
![image](https://user-images.githubusercontent.com/211430/232328024-4c78cf1a-5d1a-4036-b08e-0a09278b3c92.png)


- V záložce `Auth` vybereme `Bearer` a do pole vložíme OpenAI klíč ze sekce [View API Keys](https://platform.openai.com/account/api-keys) 

![image](https://user-images.githubusercontent.com/211430/232327991-06babf57-a6ef-4930-b6d2-9b04a0dce44b.png)

- v záložce `Body` vybereme `JSON` a vložíme data v JSON formátu
```JSON
{
  "messages": [
    {
      "role": "system",
      "content": "Jsi..."
    },
    {
      "role": "user",
      "content": "Napiš mi..."
    }
  ],
  "model": "gpt-3.5-turbo",
  "n": 1,
  "max_tokens": 2048,
  "temperature": 0.5,
  "frequency_penalty": 0.5,
  "presence_penalty": 0.5
}
```
![image](https://user-images.githubusercontent.com/211430/232328100-69875ca9-813f-46e9-936d-074a32bca473.png)

upravte hodnotu `content` u role `system` pro nastavení role bota
a role `user` pro váš příkaz

Po odeslání se zobrazí data, které vrátila API
![image](https://user-images.githubusercontent.com/211430/232328759-942a883d-cc78-4af0-b6aa-cc833ea51e4c.png)
