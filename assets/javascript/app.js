const app = {
    baseSourceUrl: "https://www.futebol365.pt/estadio/",
    baseCorsUrl: "https://cors-anywhere.herokuapp.com/",
    locations: [
        {
            name: "Estádio do Dragão",
            id: 300,
        },
        {
            name: "Estádio do Rio Ave",
            id: 727,
        },
    ],

    getData: async () => {
        return fetch(`${app.baseCorsUrl}${app.baseSourceUrl}${app.activeLocation.id}`, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        })
            .then(response => {
                if (response.ok) {
                    return response.text()
                }

                return null
            })
            .catch(error => {
                console.log("error >", error)
            })
    },

    parseContent: data => {
        const domParser = new DOMParser()
        const document = domParser.parseFromString(data, "text/html")

        const gamesTables = document.querySelectorAll(".ink-table-f365")
        const nextGamesTable = gamesTables.length && gamesTables.length > 1 ? gamesTables[1] : null

        return nextGamesTable
    },

    createSchedule: table => {
        const gamesTable = table.querySelectorAll("tbody > tr")

        return [...gamesTable].map(game => {
            const allRows = game.querySelectorAll("td")
            const dateRow = allRows[0]
            const timeRow = allRows[2]
            const homeTeamRow = allRows[3]
            const visitorTeamRow = allRows[5]

            // Date
            const dateRegex = /(\d+)-(\d+)-(\d+)/
            const dateMatch = dateRow.innerText.match(dateRegex)
            const time = timeRow.innerText
            const date = new Date(`${dateMatch[2]}-${dateMatch[1]}-${dateMatch[3]}`) // MM-DD-YYYY
            const id = new Date(`${dateMatch[2]}-${dateMatch[1]}-${dateMatch[3]} ${time}`).getTime() // MM-DD-YYYY HH:MM

            // Teams
            const homeTeam = app.cleanTeamNames(homeTeamRow.innerText)
            const visitorTeam = app.cleanTeamNames(visitorTeamRow.innerText)

            return {
                id,
                date,
                time,
                homeTeam,
                visitorTeam,
            }
        })
    },

    cleanTeamNames: team => {
        // return team.trim().replace(/(\s?\[.+\])/, "")
        return team.trim()
    },

    getGamesForToday: games => {
        if (!games.length) {
            return []
        }

        const today = new Date().setHours(0, 0, 0, 0)

        return games.filter(game => game.date.getTime() === today)
    },

    displayGamesForToday: games => {
        const mainGame = games[0]

        app.elements.answer.innerText = "Há…"
        app.elements.answer.classList.add("app__answer--positive")
        app.elements.time.innerText = mainGame.time
        app.elements.location.innerText = app.activeLocation.name
        app.elements.homeTeam.innerText = mainGame.homeTeam
        app.elements.visitorTeam.innerText = mainGame.visitorTeam

        if (games.length > 1) {
            const otherGames = games
                .filter(game => game.id != mainGame.id)
                .map(
                    game =>
                        `<li class="app__other-game">${game.homeTeam} vs ${game.visitorTeam} @ ${game.time}</li>`
                )

            app.elements.otherGames.innerHTML = otherGames
            app.elements.body.classList.add("app--multiple-games")
        }
    },

    displayNoGame: () => {
        app.elements.answer.innerText = "Não!"
        app.elements.location.innerText = app.activeLocation.name
        app.elements.answer.classList.add("app__answer--negative")
        app.elements.body.classList.add("app--no-game-for-today")
    },

    init: () => {
        app.activeLocation = app.locations[0]
        app.elements = {
            body: document.querySelector("body"),
            answer: document.querySelector(".js-answer"),
            time: document.querySelector(".js-time"),
            location: document.querySelector(".js-location"),
            homeTeam: document.querySelector(".js-hometeam"),
            visitorTeam: document.querySelector(".js-visitorteam"),
            otherGames: document.querySelector(".js-othergames"),
            loading: document.querySelector(".js-loading"),
        }

        app.getData().then(data => {
            if (data) {
                app.elements.body.classList.add("app--loaded")

                const games = app.parseContent(data)

                app.games = app.createSchedule(games) || []
                app.gamesForToday = app.getGamesForToday(app.games)

                if (app.gamesForToday.length) {
                    app.displayGamesForToday(app.gamesForToday)
                } else {
                    app.displayNoGame()
                }
            } else {
                app.elements.loading.innerText = "Erro no servidor…"
            }
        })
    },
}

export { app }
