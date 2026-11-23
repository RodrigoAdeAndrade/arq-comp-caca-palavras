# Palavras para o caça palavras
CPU
ULA
UC
REGISTRADORES
RAM
ROM
EEPROM
FLASH
CACHE
MEMORIADEMASSA
DMA
ADDRESSBUS

# Dicas pára cada palavra

Nº	Dica
1	Executa instruções e coordena operações de processamento de dados.
2	Realiza operações aritméticas e comparações lógicas.
3	Coordena a execução de instruções e controla os componentes do processador.
4	Armazenam temporariamente dados e instruções dentro do processador, com alta velocidade de acesso.
5	Armazena dados e programas em uso, mas perde seu conteúdo quando desligada.
6	Armazena instruções essenciais ao funcionamento, preservando seu conteúdo sem energia.
7	Permite apagar e regravar dados eletricamente, mantendo-os mesmo sem energia.
8	Memória não volátil que grava e apaga dados em blocos, comum em SSDs e pendrives.
9	Guarda dados frequentemente acessados para reduzir o tempo de espera do processador.
10	Armazena arquivos e programas permanentemente, mesmo após o desligamento.
11	Permite transferências de dados entre dispositivos e memória sem intervenção constante do processador.
12	Transporta informações que indicam a localização de dados ou instruções na memória.

# Organização da página

Bloco marrom à esquerda:

Incluir dicas de cada palavra, após o usuário achar a palavra que remete à dica, a frase deve ficar riscada.
Rolagem vertical interna apenas dentro do bloco para que o usuário possa ler todas as dicas sem deixar de visualizar o caça-palavras

Bloco central:
Caça palavras com as palavras do jogo distribuídas junto com letras aleatórias

Bloco marrom à direita:
Timer do da tentativa atual
Quantidade de acertos, histórico das últimas partidas do usuário

# Regras do jogo

O usuário poderá apertar em um botão de "Iniciar" para iniciar o jogo.
À direita, coloque um timer de 3 minutos decrescente que, ao acabar um tempo, deverá aparecer uma mensagem na tela do usuário informando quantes palavras ele acertou no tempo e um botão "Tente novamente" para jogar mais uma vez.
Construa 5 estruturas de caça palavras, com o mesmo nível de dificuldade, contendo as 12 palavras do jogo, que ficarão variando a cada nova tentativa do usuário.
O usuário deverá utilizar o cursor do mouse, para selecionar e arrastar na palavra que acredita que seja a certa, caso seja, a palavra fica verde e a dica é riscada.

