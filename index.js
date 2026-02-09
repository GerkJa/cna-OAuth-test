const e = require('express')
const express = require('express')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const port = process.env.PORT || 3000
const app = express()

app.get("/", (req, res) => {
    if (!req.query.token) {
        return res.send(`
            <h1>OAuth Demo</h1>
            <a href="./auth">Sign in with GitHub</a>
        `)
    }
    else {
        try {
            const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET);
            res.send(`
                <h1>Välkommen ${decoded.name}!</h1>
                <p>Ditt användarnamn är ${decoded.userName}</p>
                <p>Företag: ${decoded.company}</p>
            `)
        } catch (error) {
            return res.status(401).send("Invalid token")
        } 
}});

// vår egen endpoint för att redirecta till GitHub
app.get("/auth", (req, res) => {

    //console.log(`https://github.com/login/oauth/authorize?scope=read:user&client_id=${process.env.CLIENT_ID}`)
    res.redirect(`https://github.com/login/oauth/authorize?scope=read:user&client_id=${process.env.CLIENT_ID}`)
});

// Github callback
app.get("/github-callback", async (req, res) => {
    const body = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: req.query.code // GitHub skickar denna "temporary code grant"
    }

    try {

        const response = await fetch("https://github.com/login/oauth/access_token", {
            method: 'POST',
            headers: {'Content-type': 'application/json', 'Accept': 'application/json'},
            body: JSON.stringify(body)
        });
        const tokenData = await response.json();
        console.log(tokenData)

        
        const responseUser = await fetch("https://api.github.com/user", {
            headers: {'Authorization': `Bearer ${tokenData.access_token}`}
        });
        const githubUser = await responseUser.json();
        console.log(githubUser);
        // skapa vår egen JWT token
        const token = jwt.sign(
            {
                sub: githubUser.id,
                userName: githubUser.login,
                name: githubUser.name,
                company: githubUser.company
            },
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );
        res.redirect(`/?token=${token}`);

    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
});