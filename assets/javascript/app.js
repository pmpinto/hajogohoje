const app = {
    baseSourceUrl: "https://www.futebol365.pt/estadio/",
    baseCorsUrl: "https://cors-anywhere.herokuapp.com/",
    locations: [
        {
            name: "Porto—Estádio do Dragão",
            id: 300,
        },
        {
            name: "Lisboa—Estádio do Sport Lisboa e Benfica",
            id: 101,
        },
        {
            name: "Braga—Estádio Municipal de Braga",
            id: 810,
        },
        {
            name: "Lisboa—Estádio José Alvalade",
            id: 818,
        },
        {
            name: "Famalicão—Estádio Municipal de Famalicão",
            id: 1171,
        },
        {
            name: "Vila do Conde—Estádio do Rio Ave Futebol Clube",
            id: 727,
        },
        {
            name: "Guimarães—Estádio D. Afonso Henriques",
            id: 364,
        },
        {
            name: "Porto—Estádio do Bessa Século XXI",
            id: 120,
        },
        {
            name: "Setúbal—Estádio do Bonfim",
            id: 910,
        },
        {
            name: "Tondela—Complexo Desportivo João Cardoso",
            id: 1961,
        },
        {
            name: "Ponta Delgada—Estádio de São Miguel",
            id: 765,
        },
        {
            name: "Barcelos—Estádio Cidade de Barcelos",
            id: 342,
        },

        {
            name: "Moreira de Cónegos—Estádio Comendador Almeida Freitas",
            id: 575,
        },

        {
            name: "Funchal—Estádio do Marítimo",
            id: 544,
        },

        {
            name: "Lisboa—Estádio do Restelo",
            id: 99,
        },

        {
            name: "Paços de Ferreira—Estádio da Capital do Móvel",
            id: 651,
        },

        {
            name: "Portimão—Estádio Municipal de Portimão",
            id: 687,
        },

        {
            name: "Vila das Aves—Estádio do Clube Desportivo das Aves",
            id: 228,
        },
    ],

    getData: async selectedLocation => {
        return fetch(`${app.baseCorsUrl}${app.baseSourceUrl}${selectedLocation}`, {
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

        return [...gamesTable]
            .map(game => {
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
                const id = new Date(
                    `${dateMatch[2]}-${dateMatch[1]}-${dateMatch[3]} ${time}`
                ).getTime() // MM-DD-YYYY HH:MM

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
            .filter(game => !/(\s?\[.+\])$/.test(game.homeTeam))
    },

    cleanTeamNames: team => {
        return team.trim()
    },

    getGameForToday: games => {
        return !games.length
            ? []
            : games.filter(game => game.date.getTime() === app.today.setHours(0, 0, 0, 0))
    },

    displayGameForToday: games => {
        const mainGame = games[0]

        app.elements.answer.innerText = "Há… 🙁"
        app.elements.answer.classList.add("app__answer--positive")
        app.elements.app.classList.add("app--has-answer")
        app.elements.time.innerText = mainGame.time
        app.elements.homeTeam.innerText = mainGame.homeTeam
        app.elements.visitorTeam.innerText = mainGame.visitorTeam
    },

    displayNoGame: () => {
        app.elements.answer.innerText = "Não! 🎉"
        app.elements.answer.classList.add("app__answer--negative")
        app.elements.app.classList.add("app--has-answer")
    },

    fillLocationsDropdown: locations => {
        const optionsMarkup = locations
            .sort((locationA, locationB) => locationA.name.localeCompare(locationB.name))
            .map(location => `<option value="${location.id}">${location.name}</option>`)

        app.elements.locations.insertAdjacentHTML("beforeend", optionsMarkup)
    },

    setUpEvents: () => {
        app.elements.locations.addEventListener("change", app.onChangeLocation)
    },

    isLoading: () => {
        app.elements.app.classList.add("app--is-loading")
        app.elements.app.classList.remove("app--has-answer")
    },

    hasLoaded: () => {
        app.elements.app.classList.remove("app--is-loading")
    },

    clearDetails: () => {
        app.elements.answer.innerText = ""
        app.elements.answer.classList.remove("app__answer--positive", "app__answer--negative")

        app.elements.app.classList.remove("app--has-answer")
        app.elements.time.innerText = ""

        app.elements.homeTeam.innerText = ""
        app.elements.visitorTeam.innerText = ""
    },

    getTodayDate: () => {
        app.today = new Date()
        app.elements.today.innerText = app.today.toLocaleDateString("PT", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    },

    updatePageTitle: title => {
        document.title = `${title} | ${app.defaultTitle}`
    },

    updateURL: (id, title) => {
        const newURL = `${window.location.origin}?estadio=${id}`
        console.log(newURL, title, id)
        window.history.pushState(
            {
                id,
            },
            title,
            newURL
        )
    },

    autoSearch: () => {
        const locationIdMatch = window.location.search.match(/\d+/)

        if (locationIdMatch && locationIdMatch.length) {
            const locationId = locationIdMatch[0]
            const locationIsValid =
                app.locations.filter(location => String(location.id) === locationId).length > 0

            if (!locationIsValid) {
                return
            }

            app.isLoading()
            app.getDataForLocation(locationId)

            for (const location of app.elements.locations.options) {
                if (location.value === locationId) {
                    location.selected = true
                }
            }
            app.updatePageTitle(
                app.elements.locations.options[app.elements.locations.selectedIndex].innerText
            )
        }
    },

    getDataForLocation: locationId => {
        app.getData(locationId).then(data => {
            app.hasLoaded()

            if (data) {
                const games = app.parseContent(data)

                app.games = app.createSchedule(games) || []
                app.gameForToday = app.getGameForToday(app.games)

                if (app.gameForToday.length) {
                    app.displayGameForToday(app.gameForToday)
                } else {
                    app.displayNoGame()
                    console.log("game data", app.games)
                }
            } else {
                app.elements.error.innerText = "Erro no servidor…"
            }
        })
    },

    onChangeLocation: event => {
        const locationId = event.target.value
        console.log("location selected", event.target.value)
        app.isLoading()
        app.clearDetails()
        app.updatePageTitle(
            app.elements.locations.options[app.elements.locations.selectedIndex].innerText
        )
        app.updateURL(
            event.target.value,
            event.target.options[event.target.selectedIndex].innerText
        )

        app.getDataForLocation(locationId)
    },

    init: () => {
        app.defaultTitle = document.title
        app.elements = {
            app: document.querySelector(".app"),
            answer: document.querySelector(".js-answer"),
            time: document.querySelector(".js-time"),
            locations: document.querySelector(".js-locations"),
            homeTeam: document.querySelector(".js-hometeam"),
            visitorTeam: document.querySelector(".js-visitorteam"),
            loading: document.querySelector(".js-loading"),
            error: document.querySelector(".js-error"),
            today: document.querySelector(".js-today"),
        }

        app.setUpEvents()
        app.fillLocationsDropdown(app.locations)
        app.getTodayDate()
        app.autoSearch()
    },
}

export { app }
