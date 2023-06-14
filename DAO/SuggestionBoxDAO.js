let suggestions

export default class SuggestionBoxDAO{
    static async injectDB(client){
        try{
            suggestions = await client.db(process.env.POSTS_COLLECTION).collection("suggestions")
        }
        catch(e){
            console.log(e)
            process.exit(1)
        }
    }

    static async addSuggestion(id, text){
        let month
        const key = `${new Date().getMonth()}${new Date().getFullYear()}`
        try{
            month = await suggestions.findOne({"key": key})
        }
        catch(e){
            console.log(e)
            return {success: false}
        }
        if (month && month["text"].includes(id)) return {success: false}
        if (!month){
            try{
                await suggestions.insertOne({"key": key, "text": id + text})
            }
            catch(e){
                console.log(e)
                return {success: false}
            }
        }
        else {
            let newText = month["text"] + "`" + id + text
            try{
                await suggestions.updateOne({"key": key}, {$set: {"text": newText}})
            }
            catch(e){
                console.log(e)
                return {success: false}
            }
        }
        return {success: true}
    }
}