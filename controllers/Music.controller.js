import fetch from "node-fetch"

const client_id = "8afc27bfcdfe4f9db41d9601429b457c"
const client_secret = "b42e2c6eafbe40a7be99d99b67e48eff"
const accountsBase = "https://accounts.spotify.com"
const apiBase = "https://api.spotify.com/v1"

const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');

export default class MusicController{
    static async getAuthToken(req, res, next){
        const data = await fetch(`${accountsBase}/api/token`, {
            method: "POST",
            headers: {
                "Authorization": "Basic " + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: toUrlEncoded({"grant_type": "client_credentials"})
        })
        return await data.json()
    }
    static async getTracks(req, res, next){
        const auth_token = (await this.getAuthToken(req, res, next))["access_token"]
        const q = req.query.q || "kickback"
        const rawData = await fetch(`${apiBase}/search?q=${q}&limit=50&market=US&type=track`, {
            headers: {
                "Authorization": `Bearer ${auth_token}`
            }
        })
        if (rawData.status === 400) res.json(["empty"])
        else{
            let tracksData = (await rawData.json())["tracks"]["items"]
            let tracks = []
            tracksData.forEach(element => {
                tracks.push({id: element["id"], images: element["album"]["images"][0]["url"], name: element["name"], preview_url: element["preview_url"], artist: element["artists"][0]["name"], spotify: element["external_urls"]["spotify"]})
            })
            res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000")
            res.json(tracks)
        }
    }
}