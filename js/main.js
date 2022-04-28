class Calc {
  constructor() {
    this.settings = {
      mode: 'integer',
      priority: false,
    }
    this.isResult = false;
    this.one = 0;
    this.two = 0;
    this.operations = {
      '+': () => Number(this.one) + Number(this.two),
      '-': () => Number(this.one) - Number(this.two),
      '*': () => Number(this.one) * Number(this.two),
      '/': () => Number(this.one) / Number(this.two),
      '.': () => Number(`${this.one}.${this.two}`)
    }
    this.memory = [];
  }


  makeFloatNumber(num, symbol) {
    let allNumbers = [];
    let allSymbols = [];
    for (let i = 0; i < symbol.length + 1; i++) {
      if (symbol[i] == '.') {
        allNumbers.push(`${num[i]}.${num[i+1]}`)
      }
      if (symbol[i] != '.' && symbol[i - 1] != '.') {
        allNumbers.push(num[i])
      }
    }
    allSymbols = symbol.filter(e => e != '.')
    return [allNumbers, allSymbols]
  }

  count(string) {
    let [numbers, symbols] = this.parse(string);
    if (symbols.includes('.')) {
      [numbers, symbols] = this.makeFloatNumber(numbers, symbols)
    }
    let arrCounter = 0;
    let sum;
    const filterSymbols = symbols.filter(elem => elem != '/' && elem != '*')

    if (!this.settings.priority) {
      sum = numbers.reduce((acc, num) => {
        this.one = Number(acc);
        this.two = Number(num);
        let demoSum = this.operations[symbols[arrCounter]]();
        arrCounter++
        return demoSum
      })
      sum = Number(sum).toFixed(10)
      arrCounter = 0;
    }
    if (this.settings.priority) {
      let doppler = [...numbers];
      for (let [i, j] = [0, 0]; j < numbers.length; i++, j++) {
        let elem;
        if (symbols[j] == '*' || symbols[j] == '/') {
          this.one = doppler[i];
          this.two = doppler[i + 1];
          elem = this.operations[symbols[j]]()
          doppler.splice(i, 2, elem)
          i--
        }
      }

      sum = doppler.reduce((acc, num) => {
        this.one = Number(acc);
        this.two = Number(num);
        let demoSum = this.operations[filterSymbols[arrCounter]]();
        arrCounter++
        return demoSum
      })
      arrCounter = 0;
    }
    this.isResult = true;

    //check which mode choosen integer or float

    if (this.settings.mode == 'integer') {
      return Math.floor(sum)
    } else {
      return Number(sum)
    }
  }

  parse(string) {
    const isNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, Infinity];
    let numbersArr = [];
    let symbolArr = [];
    let char = '';

    for (let i = 0; i < string.length; i++) {
      //check if first symbol is minus
      if (string[0] == '-' && i == 0) {
        char = string[i]
        i++
      }
  
      if (isNumbers.includes(Number(string[i]))) {
        if (!isNumbers.includes(Number(string[i - 1]))) {
          if (char == '-') {
            char += string[i]
          } else {
            char = string[i];
          }

        } else {
          char += string[i];
        }
      }
      
      if (Object.keys(this.operations).includes(string[i])) {
        if (char) {
          numbersArr.push(char);
          char = '';
        }
        if (Object.keys(this.operations).includes(string[i - 1])) {

        } else symbolArr.push(string[i]);
      }
    
      if (string.length - 1 == i) {
        if (char) {
          numbersArr.push(char);
        }
      }
      if (string[i] == "I" && string.includes('Infinity')) {
        numbersArr.push('Infinity');
        i += "Infinity".length - 1;
      }
    }
    return [numbersArr, symbolArr]
  }

  showOnDisplay() {
    const isNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const numbers = document.querySelector('.numbers')
    const display = document.querySelector('.main-display')
    numbers.addEventListener('click', (event) => {
      let lastChar = display.textContent[display.textContent.length - 1];
      let target = event.target;
      if (target == numbers) {
        return
      }
      if (Object.keys(this.operations).includes(lastChar) && Object.keys(this.operations).includes(target.textContent)) {
        display.textContent = display.textContent.slice(0, -1) + target.textContent
      }
      //answer on screen
      else if (this.isResult) {
        if (target.innerText == '=') {
          return
        }
        if (Object.keys(this.operations).includes(target.textContent)) {
          this.isResult = false;
          display.textContent += target.innerText;
        } else {
          this.isResult = false;
          display.textContent = target.innerText;
        }
      }
      //0 on screen
      else if (display.textContent == '0') {
        if (isNumbers.includes(Number(target.textContent))) {
          display.textContent = target.innerText;
        } else if (Object.keys(this.operations).includes(target.textContent)) {
          display.textContent += target.innerText;
        }
      } else if (target.innerText == '=') {
        let finale = this.count(display.textContent);
        this.memory.push([display.textContent, finale]);
        display.textContent = finale;
        this.showingMemories();
      } else {
        display.textContent += target.innerText;
      }
    })
  }

  clean() {
    const clean = document.querySelector('.cleaner-button');
    const display = document.querySelector('.main-display')
    clean.addEventListener('click', () => {
      display.textContent = 0
    })
  }

  showingMemories() {
    const memo = document.querySelector('.memory-display');
    memo.textContent = this.memory.map(([ex, sum]) => {
      return `${ex} = ${sum}`
    }).join(', ')
  }

  checkMode() {
    const form = document.querySelector('.integrity')
    const doButton = document.querySelector('.operation[data-blocked]');
    form.addEventListener('click', (event) => {
      if (event.target.id == 'float') {
        this.settings.mode = 'float';
        doButton.dataset.blocked = 'false'
        doButton.disabled = false;
      } else if (event.target.id == 'integer') {
        this.settings.mode = 'integer';
        doButton.dataset.blocked = 'true'
        doButton.disabled = true;
      }
    })
  }

  checkPriority() {
    const box = document.querySelector('.priority label')
    box.addEventListener('click', (event) => {
      if (event.target.id == 'priority')
        this.settings.priority = event.target.checked
    })
  }

  workInProgress() {
    this.showOnDisplay();
    this.checkMode()
    this.checkPriority()
    this.clean();
    this.sendJSON();
  }

  toJSON() {
    let jsonFile = {};
    this.memory.forEach((elem => {
      jsonFile[elem[0]] = String([elem[1]])
    }))
    return JSON.stringify(jsonFile)
  }

  sendJSON() {
    let jsonButtons = document.querySelector('.json-buttons');

    jsonButtons.addEventListener('click', (e) => {
      if (!e.target.classList.contains('json-button')) {
        return
      } else {
        let type = e.target.classList;
        if (type.contains('json-console')) {
          console.log(this.toJSON())
        }
        if (type.contains('json-page')) {
          window.open(`json.html?json=${this.toJSON()}`)
        }
      }
    })
  }
}

let calc = new Calc();
calc.workInProgress();

