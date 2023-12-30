---
title: "Python AsyncIO"
categories:
    - Python
    - AsyncIO
    - AsynchronousProgramming
tags:
    - python
    - asyncio
    - parallelism
---

## Definitions
- event loop: a loop that can register async tasks, wait for them to complete, and "pick them up" when they're complete

## Overview
- `async` functions are declared with `async def` keyword
- all `async` functions must be `await`ed -- they cannot be called normally
    - `async` functions are `await`ed in the event loop
- `async` tasks can be either individually attached to the event loop, or they can be attached in a batch to the event loop
    - if `async` tasks are individually attached, then those attachments will be done serially (slower)
    - if `async` tasks are batched and attached to the event loop, then the attachments are done in parallel (faster)
- to batch `async` tasks, use `asyncio.gather()` where the args are `async` functions to be called
- `async` and `await` syntax can only be used on `async` functions -- can NOT be used on regular functions

### Event loop
- full code:
```
import asyncio

async def noop():
    pass()

loop = asyncio.get_event_loop()
loop.run_until_complete(noop())
loop.close()
```
- can be shorted to this:
```
import asyncio

async def noop():
    pass()

asyncio.run(noop())
```

### Examples
- synchronous code:
```
import requests
import os
import time
# To work with the .env file
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv('ALPHAVANTAGE_API_KEY')
url = 'https://www.alphavantage.co/query?function=OVERVIEW&symbol={}&apikey={}'
symbols = ['AAPL', 'GOOG', 'TSLA', 'MSFT', 'PEP']
results = []

def run_tasks():
    for symbol in symbols:
        response = requests.get(url.format(symbol, api_key))
        results.append(response.json())

print("Timer started...")
start = time.time()
run_tasks()
end = time.time()
total_time = end - start
print("It took {} seconds to make {} API calls".format(total_time, len(symbols)))
```
- asynchronous code:
```
import aiohttp
import asyncio
import os
import time
# To work with the .env file
from dotenv import load_dotenv
load_dotenv()

API_KEY = os.getenv('ALPHAVANTAGE_API_KEY')
URL = 'https://www.alphavantage.co/query?function=OVERVIEW&symbol={}&apikey={}'
SYMBOLS = ['AAPL', 'GOOG', 'TSLA', 'MSFT', 'PEP']
results = []

def get_tasks(session):
    tasks = []
    for symbol in SYMBOLS:
        tasks.append(session.get(URL.format(symbol, API_KEY), ssl=False))
    return tasks

async def run_tasks():
    session = aiohttp.ClientSession()
    tasks = get_tasks(session)
    # You could also use: 
    # tasks = [session.get(URL.format(symbol, API_KEY), ssl=False) for symbol in SYMBOLS]

    # Can't do this!!
    # It has to be a one-liner
    # for symbol in symbols:
    #     tasks.append(session.get(url.format(symbol, api_key)))
    responses = await asyncio.gather(*tasks)
    for response in responses:
        results.append(await response.json())
    await session.close()

print("Timer started...")
start = time.time()
asyncio.run(run_tasks())
end = time.time()
total_time = end - start
print(
    f"Time to make {len(SYMBOLS)} API calls with tasks, it took: {total_time}")
```

```
import asyncio
import aiohttp
import os
import time
# To work with the .env file
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv('ALPHAVANTAGE_API_KEY')
url = 'https://www.alphavantage.co/query?function=OVERVIEW&symbol={}&apikey={}'
symbols = ['AAPL', 'GOOG', 'TSLA', 'MSFT', 'AAPL']
results = []

start = time.time()

def get_tasks(session):
    tasks = []
    for symbol in symbols:
        tasks.append(asyncio.create_task(session.get(url.format(symbol, api_key), ssl=False)))
    return tasks

async def get_symbols():
    async with aiohttp.ClientSession() as session:
        tasks = get_tasks(session)
        # you could also do
        # tasks = [session.get(URL.format(symbol, API_KEY), ssl=False) for symbol in symbols]
        responses = await asyncio.gather(*tasks)
        # for response in responses:
        #     results.append(await response.json())

asyncio.run(get_symbols())

end = time.time()
total_time = end - start
print("It took {} seconds to make {} API calls".format(total_time, len(symbols)))
print('You did it!')
```