import argparse
import sys
import asyncio
import os
import gnureadline
from ChatGPT_lite.ChatGPT import Chatbot


async def async_main(args):
    if args.session_token is None:
        print("Please provide a session token")
        sys.exit(1)

    chat = Chatbot(args.session_token, args.bypass_node)
    await asyncio.gather(chat.wait_for_ready())

    while True:
        try:
            prompt = input("You: ")
            if prompt == "!exit":
                break
            response: dict[str, str] | None = await chat.ask(prompt)
            assert response != None, 'No response'
            print(f"\nBot: {response['answer']}\n")
        except KeyboardInterrupt:
            break
    # Close sockets
    chat.close()
    # exit
    sys.exit(0)


def sync_main(args):
    chat = Chatbot(args.session_token, args.bypass_node)

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(chat.wait_for_ready())
    while True:
        try:
            prompt = input("You: ")
            if prompt == "!exit":
                break
            response = loop.run_until_complete(chat.ask(prompt))
            print(f"\nBot: {response['answer']}\n")
        except KeyboardInterrupt:
            break
    # Close sockets
    chat.close()
    # stop asyncio event loop
    loop.stop()
    # exit
    sys.exit(0)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--session_token', type=str, default=os.environ.get('CHATGPT_TOKEN'))
    parser.add_argument('--bypass_node', type=str,
                        default="https://gpt.pawan.krd")
    parser.add_argument('-a', '--async_mode', action='store_true')
    args = parser.parse_args()

    if args.session_token is None:
        print("Please provide a session token")
        sys.exit(1)

    print("Starting. Please wait...")
    if args.async_mode:
        print('async mode')
        asyncio.run(async_main(args))
    else:
        print('sync mode')
        sync_main(args)


if __name__ == "__main__":
    main()