

export class GithubUser {
  static search(username) {
    const searchApi = `https://api.github.com/users/${username}`

    return fetch(searchApi)
      .then(data => data.json())
      .then(({ login, name, public_repos, followers }) => ({
        login,
        name,
        public_repos,
        followers
      }))
  }
}

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {

    try {
      const userExists = this.entries.find(entry => entry.login.toLowerCase() === username.toLowerCase())
      if (userExists) {
        throw new Error('Esse usuário já existe na sua lista de favoritos')
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error('Este usuário não existe')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
      // this.checkHowManyUsers()

    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
    // this.checkHowManyUsers()
  }
}


export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.noFavorite = this.root.querySelector(".no-favorite");
    this.tbody = this.root.querySelector("table tbody");
    this.scrollbar = this.root.querySelector(".scrollbar");

    this.update()
    this.onAdd()
    this.scroll()
    // this.checkHowManyUsers()

  }


  onAdd() {
    const buttonAdd = this.root.querySelector('.search button')

    buttonAdd.onclick = () => {
      const { value } = this.root.querySelector('.input-search')

      this.add(value)
    }

  }

  update() {
    this.removeAllTr()
    this.checkHowManyUsers()

    this.entries.forEach((user) => {
      const row = this.createRow()
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user a span').textContent = `/${user.login}`
      row.querySelector('.user a p').textContent = user.name
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar este usuário?')
        if (isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
    <tr>
    <td class="user">
        <img src="" alt="">
        <a href="" target="_blank">
          <p></p>
          <span></span>
        </a>
    </td>
    <td class="repositories">
        
    </td>
    <td class="followers">
        
    </td>
    <td>
        <button class="remove">Remove</button>
    </td>
    </tr>
    `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr')
      .forEach((tr) => {
        tr.remove()
      })
  }

  checkHowManyUsers() {

    if (this.entries.length === 0) {
      this.tbody.style.minHeight = "63.1rem"

      this.scrollbar.classList.add('hide')
      this.noFavorite.classList.remove('hide')
    } else {
      this.noFavorite.classList.add('hide')
    }

    if (this.entries.length >= 1 && this.entries.length <= 3) {
      this.tbody.style.maxHeight = "31.6rem"
      this.scrollbar.classList.add('hide')
    }


    if (this.entries.length > 3 && this.entries.length < 6) {
      this.scrollbar.classList.remove('hide')
      this.tbody.style.maxHeight = "31.6rem"
    }

    if (this.entries.length >= 7) {
      this.tbody.style.maxHeight = "63.1rem"
    } else if (this.entries.length < 7 && this.entries.length >= 1) {
      this.tbody.style.maxHeight = "31.6rem"
      this.tbody.style.minHeight = "10.5rem"
    }
  }

  scroll() {

    const tbody = document.querySelector('tbody')
    const scrollbar = document.querySelector('.scrollbar')

    let finalPosition = 62
    tbody.scrollTop = 0

    function updateScrollbar() {
      const tbodyHeight = tbody.scrollHeight

      const visibleHeight = tbody.clientHeight
      const scrollbarHeight = scrollbar.clientHeight
      const maxScroll = tbodyHeight - visibleHeight
      const scrollPercentage = (tbody.scrollTop / maxScroll) * 95
      const maxScrollbarTop = visibleHeight - scrollbarHeight
      const scrollbarTop = (scrollPercentage / 100) * maxScrollbarTop
      scrollbar.style.top = scrollbarTop + finalPosition + 'px'
    }

    tbody.addEventListener('scroll', updateScrollbar)
  }
}


