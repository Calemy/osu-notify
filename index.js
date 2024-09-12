import { WindowsToaster } from "node-notifier"
import fetch from "node-fetch"
import { createWriteStream } from "fs"
import { execSync } from "child_process"
import { auth, v2 } from "osu-api-extended"

const cache = {}

await auth.login('22714', 'qeaDaHxlFZCQ0KVflDkT9Jl5EAl2OQ7Unx1GTZyR', ["public"]);

const notifier = new WindowsToaster()

setInterval(() => check(), 1000 * 30)

async function check(startup = false){
    const { events } = await v2.beatmaps.events({
        types: ["approve", "rank"],
    })

    for (const event of events) {
        const { beatmapset } = event
        const { id, title, artist, creator } = beatmapset
        if(startup){
            cache[id] = 1
            continue;
        }
        if(cache[id]) continue;

        cache[id] = 1

        notifier.notify({
            message: `${artist} - ${title} by ${creator} got ranked!`,
        }, async (err, data) => {
            if(data == "dismissed" || data == "timeout") return;
            const request = await fetch(`https://catboy.best/d/${id}`)
            const stream = createWriteStream(`./${id}.osz`)
            request.body.pipe(stream)
            stream.on("close", () => execSync(`${id}.osz`))
        });
    }
}

check(true)