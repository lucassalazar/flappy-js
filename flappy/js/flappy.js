function createNewElement(tagName, className) {
    const elem = document.createElement(tagName);
    elem.className = className; // O mesmo pode ser feito utilizando classList.add()
    return elem;
}

// Função construtora
function Barrier(reverse = false) { // Se reverse = true, criará uma barreira no topo
    this.element = createNewElement('div', 'barrier');

    const barrierBorder = createNewElement('div', 'barrierBorder');
    const barrierBody = createNewElement('div', 'barrierBody');
    
    // Utilizando o booleano reverse para definir a ordem do appendChild
    this.element.appendChild(reverse ? barrierBody : barrierBorder);
    this.element.appendChild(reverse ? barrierBorder : barrierBody);

    this.setHeight = newHeight => barrierBody.style.height = `${newHeight}px`;
}

// const b = new Barrier(true);
// b.setHeight(300);
// document.querySelector('[wm-flappy]').appendChild(b.element);

function CoupleOfBarriers(gameHeight, gapSize, xPosition) {
    this.element = createNewElement('div', 'couple-of-barriers');

    // Quando se cria uma variavel do tipo this dentro de uma função construtora, esta fica visivel fora da função. Neste caso as barreiras estão visíveis para que se possa tratar mais tarde o problema das colisões.
    this.topBarrier = new Barrier(true);
    this.bottomBarrier = new Barrier(false);

    // Adicionando a barreira superior e a barreira inferior dentro da div couple-of-barriers
    this.element.appendChild(this.topBarrier.element);
    this.element.appendChild(this.bottomBarrier.element);

    // Criando barreiras com altura aleatória
    this.randomBarrierHeight = () => {
        const topBarrierHeight = Math.random() * (gameHeight - gapSize);
        const bottomBarrierHeight = gameHeight - gapSize - topBarrierHeight;
        this.topBarrier.setHeight(topBarrierHeight);
        this.bottomBarrier.setHeight(bottomBarrierHeight);
    }

    // Função que retorna a atual posição do par de barreiras no eixo X
    this.getPositionX = () => parseInt(this.element.style.left.split('px')[0]);

    // Função para setar a posição do par de barreiras no eixo X
    this.setPositionX = xPosition => this.element.style.left = `${xPosition}px`;
    
    // Função que retorna a largura do par de barreiras
    this.getElementWidth = () => this.element.clientWidth;

    // Criando a altura das barreiras de forma aleatória já com os parâmetros da função
    this.randomBarrierHeight();
    
    // Setando a posição do par de barreiras já com os parâmetros da função
    this.setPositionX(xPosition);
}

// const b = new CoupleOfBarriers(700, 200, 400);
// document.querySelector('[wm-flappy]').appendChild(b.element);

// Função construtura que cria uma sequência de barreiras
function Barriers(gameHeight, gameWidth, gapSize, spaceBetweenBarriers, increaseScore) {
    this.couples = [
        new CoupleOfBarriers(gameHeight, gapSize, gameWidth),
        new CoupleOfBarriers(gameHeight, gapSize, gameWidth + spaceBetweenBarriers),
        new CoupleOfBarriers(gameHeight, gapSize, gameWidth + spaceBetweenBarriers * 2),
        new CoupleOfBarriers(gameHeight, gapSize, gameWidth + spaceBetweenBarriers * 3) 
    ];

    const displacement = 3; // Quantidade de pixels no deslocamento das barreiras
    this.animate = () => {
        this.couples.forEach(couple => {
            // Setará a posição do par de barreiras para a posição atual menos o deslocamento
            couple.setPositionX(couple.getPositionX() - displacement);

            // Se o par de barreiras chegar ao fim da div a esquerda
            if(couple.getPositionX() < -couple.getElementWidth()) {
                // A posição do par de barreiras é setada para o espaço entre os pares de barreiras vezes o numero de pares do array. Isso é feito para que quando o par de barreiras desapareça por completo ele volte ao fim do array.
                couple.setPositionX(couple.getPositionX() + spaceBetweenBarriers * this.couples.length);
                couple.randomBarrierHeight(); // Modifica o par de barreiras para que este apareça no futuro com alturas aleatórias.
            }
            const middle = gameWidth / 2;
            const crossedTheMiddle = couple.getPositionX() + displacement >= middle && couple.getPositionX() < middle;
            if(crossedTheMiddle) {
                increaseScore();
            }
        });
    }
}

function Bird(gameHeight) {
    let flying = false;

    this.element = createNewElement('img', 'bird');
    this.element.src = 'imgs/leo.webp';

    this.getPositionY = () => parseInt(this.element.style.bottom.split('px')[0]);
    this.setPositionY = yPosition => this.element.style.bottom = `${yPosition}px`;
    
    window.onkeydown = e => flying = true;
    window.onkeyup = e => flying = false;
    window.ontouchstart = e => flying = true;
    window.ontouchend = e => flying = false;

    this.animate = () => {
        const newY = this.getPositionY() + (flying ? 6 : -5);
        // A altura máxima do voo do pássaro é a altura do jogo menos a altura do próprio pássaro.
        const maxHeight = gameHeight - 10 - this.element.clientHeight;

        if(newY <= 0) {
            this.setPositionY(0);
        } else if (newY >= maxHeight) {
            this.setPositionY(maxHeight);
        } else {
            this.setPositionY(newY);
        }
    }
    this.setPositionY(gameHeight / 2);
}


function Score() {
    this.element = createNewElement('span', 'score');
    this.updateScore = points => {
        this.element.innerHTML = points;
    }
    // Inicializando a pontuação com zero
    this.updateScore(0);
}

// const barriers = new Barriers(700, 1200, 200, 400);
// const bird = new Bird(700);
// const gameArea = document.querySelector('[wm-flappy]');

// gameArea.appendChild(bird.element);
// gameArea.appendChild(new Score().element);
// barriers.couples.forEach(couple => gameArea.appendChild(couple.element));
// setInterval(() => {
//     barriers.animate();
//     bird.animate();
// }, 20);

// Função que trata a sobreposição
function overlapping(elementA, elementB) {
    const a = elementA.getBoundingClientRect(); // O retângulo associado ao elemento A
    const b = elementB.getBoundingClientRect(); // O retângulo associado ao elemento B

    // Se a distância da extremidade esquerda do elemento A for maior ou igual a distância da extremidade esquerda do elemento B
    // E
    // Se a distancia da extremidade esquerda do elemento B for maior ou igual a distância da extremidade esquerda do elemento A
    // Houve uma sobreposição na horizontal
    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;

    // A mesma lógica explicada acima é utilizada para detectar uma sobreposição vertical
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;

    return horizontal && vertical; // Se as duas situações forem verdadeiras, houve sobreposição
}

function birdCollision(bird, barriers) {
    let collision = false;
    barriers.couples.forEach(couple => {
        if(!collision) { // Apenas entra neste if se a colisão estiver falsa
            const topBarrier = couple.topBarrier.element;
            const bottomBarrier = couple.bottomBarrier.element;
            // Se o passaro estiver sobreposto com a barreira superior ou com a barreira inferior, significa que houve uma colisão.
            collision = 
            overlapping(bird.element, topBarrier) || overlapping(bird.element, bottomBarrier);
        }
    });
    return collision;
}

function FlappyBird() {
    let points = 0;

    const gameArea = document.querySelector('[wm-flappy]');
    const gameHeight = gameArea.clientHeight;
    const gameWidth = gameArea.clientWidth;

    const score = new Score();
    const barriers = new Barriers(gameHeight, gameWidth, 200, 400, () => {
        score.updateScore(++points);
    });
    const bird = new Bird(gameHeight);

    gameArea.appendChild(score.element);
    gameArea.appendChild(bird.element);
    barriers.couples.forEach(couple => gameArea.appendChild(couple.element));

    this.start = () => {
        // Loop do jogo
        const timer = setInterval(() => { // Quando houver uma colisão o timer irá parar
            barriers.animate();
            bird.animate();

            if(birdCollision(bird, barriers)) {
                bird.element.src = 'imgs/deadleo.webp'
                clearInterval(timer);
            }
        }, 20);
    }
}

new FlappyBird().start();