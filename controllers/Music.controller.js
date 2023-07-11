import fetch from "node-fetch"
import dotenv from "dotenv"

dotenv.config()

const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
const accountsBase = process.env.SPOTIFY_ACCOUNTS_BASE
const apiBase = process.env.SPOTIFY_API_BASE

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