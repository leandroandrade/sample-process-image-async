# sample-process-image-async

Exemplo de upload de imagem usando BullMQ e Fastify.

Basicamente o `Worker` pega a imagem enviada e converte para o formato `webp` em vários tamanhos.

A ideai principal é apresentar um processamento **assíncrono**, ou seja, evitar que o usuário fique aguardando todo o processamento finalizar.


## Get Started

Inicie o container do Redis:
```shell
docker compose up -d
```

Inicie a aplicação:
```shell
npm run dev
```

URL para upload:
```http request
http://localhost:3000/
```

URL para visualização das imagens enviadas:
```http request
http://localhost:3000/result
```

## Tests

Para execução dos testes, faz-se necessário que o container do `Redis` esteja em execução (sim, existem outras abordagem). 

**Dica**: evite ao máximo fazer mock de database para testes. 😁


## Redis config

De acordo com a documentação do `BullMQ`, a configuração abaixo precisa ser realizada no Redis em **produção**:

* maxmemory-policy=noeviction
