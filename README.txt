Aplikace pro plánování směn (Shift Manager) je pro účely práce nasazena na produkčním serveru Heroku s cloudovou databází poskytovanou MongoDB Atlas.
Aplikace je dostupná na serveru https://shiftmanagertnpw.herokuapp.com/ - (Jelikož Heroku aplikace při nepoužívání uspává, je třeba chvíli počkat na první načtení)

Přístup do aplikace: (Do aplikace je povolen přístup ve třech rolích, uživatele, manažera a administrátora)
Bylo tak vytvořeno několik účtů, pracovních pozic a úvazků k potřebě testování aplikace. (Při nasazení do podniku by byl každý účet vázán na uživatelovu emailovou adresu.)

Administrátor - email: admin@shiftmanagerbp.com | heslo: 0000 
Manažer - email: manager@shiftmanagerbp.com | heslo: 0000
Uživatel 01 - email: user01@shiftmanagerbp.com | heslo: 0000 
Uživatel 02 - email: user02@shiftmanagerbp.com | heslo: 0000 
Uživatel 03 - email: user03@shiftmanagerbp.com | heslo: 0000 

Při registraci nového uživatele je jeho heslo automaticky generováno a posíláno na email, proto je třeba zadat správnou emailovou adresu.

Spouštění na vývojovém prostředí:

Je třeba mít nainstalované prostředí Node.js ve verzi 12.x (https://nodejs.org/dist/latest-v12.x/).
Je třeba mít nainstalovanou MongoDB v lokáním prostředí (https://www.mongodb.com/try/download/community).

Dále je třeba nainstalovat všechny závislosti aplikace pomocí příkazu: npm run init (Příkaz spouštět v kořenovém adresáři aplikace).
Poté spustit pomocí příkazu: npm run dev

Při prvním spuštěním na vývojovém prostředí je vytvořen účet administrátora (email: admin@shiftmanagerbp.com | heslo: 0000), který musí aplikaci nastavit ke správnému fungování.
Administrátor musí nastavit pracovní pozice a úvazky a registrovat uživatele.

Následně je možné aplikaci plně využívat na adrese http://localhost:8080