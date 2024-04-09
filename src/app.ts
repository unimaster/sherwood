//BOT_TOKEN="6988126875:AAGaOajd5KPzma1-V-O1fvjp8-8zRRSIRtg" npx ts-node src/app.ts

import { Composer, Context, Scenes, Markup, Telegraf, Telegram, session  } from 'telegraf';
// import {Update} from "typegram";
import axios from 'axios';
// import { Redis } from "@telegraf/session/redis";


require('dotenv').config();

const token: string = process.env.BOT_TOKEN as string;
const env: string = process.env.ENV as string;

// const telegram: Telegram = new Telegram(token);
const bot: Telegraf<Scenes.SceneContext> = new Telegraf(token);

// const store = Redis({ url: "redis://127.0.0.1:6379" });
// bot.use(session({ store }));
bot.use(session());

const chatId: string = process.env.CHAT_ID as string;

let activeChats = new Set();

// Create a map to store the previous screen for each user
let previousScreens = new Map();
let currentScreens = new Map();

const screens = {
    before_start: {
        text: 'Friar Tuck is designed for marketing and trust. All funds sent to this wallet can only be transferred to wallets from the marketing whitelist, which includes proven KoLs and influencers. There are no other withdrawal options. By using Tuck, developers can assure token holders of their commitment to building the product and not selling their share. Users can receive notifications on all marketing wallet transactions and anticipate upcoming promos.\n\n' +
            'Press /start to open the main menu with all our features.\n' +
            'Before topping up your balance, watch our video guide: [LINK]'
    },
    start: {
        text: '<b>Friar Tuck</b> welcomes you! 🎉\n\n' +
            'I\'ve created your new wallet.\n' +
            'Fund it for marketing by sending tokens to this address:\n' +
            '<code>{wallet}</code>\n\n' +

            'Remember to add some SOL for transaction fees.\n' +
            'Funds sent to the marketing wallet cannot be withdrawn. They can only be used for the services we offer or burned.\n\n' +
            '🤖 Tip: To boost confidence and curiosity among investors, consider adding our Little John bot to your token\'s Telegram chat! He\'ll keep everyone updated on the wallet activities, fostering a transparent and engaged community.',
        keyboard: [
            {
                text: 'Services',
                action: 'services'
            },
            {
                text: 'Wallet',
                action: 'wallet'
            },
            {
                text: 'Info',
                action: 'info'
            },
            {
                text: 'Settings',
                action: 'settings'
            },
            {
                text: 'Help',
                action: 'help'
            }
        ],
        columns: 3
    },
    services: {
        text: 'Choose a Service to Pay For',
        keyboard: [
            {
                text: '📞 Calls',
                action: 'calls'
            },
            {
                text: '📈 Trending',
                action: 'trending'
            },
            {
                text: '🔍Screener Update',
                action: 'screener'
            },
            {
                text: '🛤️ FastTrack Listing',
                action: 'fasttrack',
                disabled: true
            },
            {
                text: '🔙 Back',
                action: 'start'
            }
        ],
        columns: 2
    },
    calls: {
        text: 'Choose a Service to Pay For',
        keyboard: [
            {
                text: 'The Soltice',
                action: 'callto',
                user: '@thesolitice'
            },
            {
                text: 'Mad Apes',
                action: 'callto',
                user: '@madapes'
            },
            {
                text: 'POE',
                action: 'callto',
                user: '@poe'
            },
            {
                text: 'NoName User',
                action: 'callto',
                user: '@noname',
                disabled: true
            },
            {
                text: 'NoName User',
                action: 'callto',
                user: '@noname',
                disabled: true
            },
            {
                text: '🔙 Back',
                action: 'services'
            }
        ],
        columns: 3
    },
    callto: {
        text: 'The Call costs X SOL or Y your tokens. Please ensure that your links are correct and provide advertising preferences. If all the info is correct, press \'Book Call\' to confirm.',
        keyboard: [
            {
                text: 'Update',
                action: 'info'
            },
            {
                text: 'Book Call',
                action: 'bookcall'
            },
            {
                text: '🔙 Back',
                action: 'calls'
            }
        ],
        columns: 2
    },
    bookcall: {
        text: 'Check and confirm your application details:\n' +
            'CA:0x4F39a7bEC6724832B11F8e7CD7485F2B86CE6789\n' +
            'Website: example.com\n' +
            'Telegram: @telegramuser\n' +
            'Twitter: @twitterhandle\n' +
            'Additional Information: For any further inquiries, please contact our support team.\n' +
            '\n' +
            'Payment: X SOL = Y tokens',
        keyboard: [
            {
                text: 'Exchange to SOL after request acceptance ❌',
                action: 'x_to_sol'
            },
            {
                text: 'Exchange to SOL now ✅',
                action: 'x_to_sol_force'
            },
            {
                text: 'Apply',
                action: 'apply'
            },
            {
                text: '🔙 Back',
                action: 'callto'
            }
        ],
        columns: 2
    },
    screener: {
        text: 'Choose a Service to Pay For',
        keyboard: [
            {
                text: 'Dex Screener',
                action: 'screenerupdate'
            },
            {
                text: 'Birdeye',
                action: 'screenerupdate'
            },
            {
                text: 'Dextools',
                action: 'screenerupdate'
            },
            {
                text: 'Moontok',
                action: 'screenerupdate'
            },
            {
                text: '🔙 Back',
                action: 'services'
            }
        ],
        columns: 3
    },
    screenerupdate: {
        text: 'Screener Update costs 1.5 SOL or 175433 $SHER. Please review and update your token info if needed:\n' +
            'CA: BfHkvKMEYjwPXnL36uiM8RnAoMFy8aqNyTJXYU3ZnZtr\n' +
            'Website: sherwood.com\n' +
            'Telegram: @sherwood\n' +
            'Twitter: @sherwood\n' +
            'Additions: not submitted',
        keyboard: [
            {
                text: 'Update',
                action: 'info',
                //TODO: ned to process this back instead screen back button action
                back: true
            },
            {
                text: 'Apply',
                action: 'screener_apply'
            },
            {
                text: 'Refresh',
                action: 'update'
            },
            {
                text: '🔙 Back',
                action: 'screener'
            }
        ],
        columns: 2
    },
    screener_apply: {
        text: 'The request was submitted, please await an update.',
        keyboard: [
            {
                text: '🔙 Back',
                action: 'screener'
            }
        ],
    },
    wallet: {
        text: '<b>Your current balance:</b>\n' +
            'Your balance is {balance} SOL\n' +
            '{token_balance} tokens - {token_balance_sol} SOL\n\n' +
            '<b>Wallet address:</b>\n' +
            '<code>{wallet}</code>',
        keyboard: [
            {
                text: 'Sell Y',
                action: 'sell',
                checked: true
            },
            {
                text: ' Buy Y',
                action: 'buy',
            },
            {
                text: 'Apply',
                action: 'apply',
            },
             {
                text: 'X SOL',
                action: 'xsol'
            },
             {
                text: ' X Slippage',
                action: 'xslippage'
            },
            {
                text: 'Refresh',
                action: 'wallet'
            },
            {
                text: 'AirDrop [dev]',
                action: 'airdrop',
            },
            {
                text: '🔙 Back',
                action: 'start'
            }
        ],
        columns: 3
    },
    apply: {
        text: '🟢 Fetched Quote (Jupiter)\n' +
            '0.002 SOL ($0.37) ⇄  301974 SIGMA ($0.37)',
        keyboard: [
            // {
            //     text: 'Refresh',
            //     action: 'wallet_refresh'
            // },
            {
                text: '🔙 Back',
                action: 'wallet'
            }
        ],
        columns: 1
    },
    xslippage: {
        text: 'Enter buy slippage %',
        scene: 'question',
    },
    info: {
        text: 'Review and update your token info.\n' +
            'Current info:\n' +
            'CA: xxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n' +
            'Website: yyy.com\n' +
            'Telegram: rrr.tg\n' +
            'Twitter: ttt.com\n' +
            'Additions: 📝 unavailable',
        keyboard: [
            {
                text: 'Update CA',
                action: 'update:contract'
            },
            {
                text: 'Update Website',
                action: 'update:website'
            },
            {
                text: 'Update Telegram',
                action: 'update:telegram'
            },
            {
                text: 'Update Twitter',
                action: 'update:twitter'
            },
            {
                text: 'Update Additional Info',
                action: 'update:additional'
            },
            {
                text: '🔙 Back',
                action: 'start'
            }
        ],
        columns: 2
    },
    settings: {
        text: 'Settings',
        keyboard: [
            {
                text: 'Language',
                action: 'language'
            },
            {
                text: 'Notifications',
                action: 'notifications'
            },
            {
                text: '🔙 Back',
                action: 'start'
            }
        ],
        columns: 3
    },
    airdrop: {
        text: 'Airdrop 1 SOL',
        scene: 'question',
        processor: async (ctx:Scenes.SceneContext) => {
            let balance = await airdropWallet(ctx);
            await ctx.reply("Droped");
        },
        back: 'wallet'
    },
    back: {},
    get: (key: any):any => {
        if (screens.hasOwnProperty(key)) {
            // @ts-ignore
            return screens[key];
        }

        return false;
    }
}

/* VARIABLES SETUP */

let allActions: string[] = [];
for (let key in screens) {
    // @ts-ignore
    let buttons = screens[key].keyboard;
    if (buttons) {
        buttons.forEach((button: { action: string; }) => {
            allActions.push(button.action);
        })
    }
}

/* END VARIABLES SETUP */

/* FUNCTIONS SETUP */
//TODO: it should be in models

let getPreviousScreen = (ctx: Context) => {
    if (!ctx.chat) {
        return;
    }

    let previousScreen = previousScreens.get(ctx.chat.id);
    if (previousScreen) {
        return previousScreen;
    } else {
        // If there's no previous screen, default to the 'start' screen
        return 'start';
    }
}

let getCurrentScreen = (ctx: Context) => {
    if (!ctx.chat) {
        return;
    }

    let currentScreen = currentScreens.get(ctx.chat.id);
    if (!currentScreen) {
        currentScreen = 'start';
        currentScreens.set(ctx.chat.id, currentScreen);
    }

    return currentScreen;
}

//TODO: conditions for errors on creating wallet
const getWallet = async (ctx: Context) => {
    if (!ctx.from) {
        return;
    }

    try {
        let response = await axios({
            url: `http://localhost:3000/wallets/create/${ctx.from.id}-${env}`,
            method: 'get',
            timeout: 8000,
            headers: {
                'Content-Type': 'application/json',
            }
        })

        if(response.status == 200){
            // test for status you want, etc
            // console.log(response.status)
        }

        return response.data.wallet
    } catch (err) {
        console.error(err);
    }
}

let getBalance = async (ctx: Context) => {
    if (!ctx.from) {
        return;
    }

    try {
        let response = await axios({
            url: `http://localhost:3000/wallets/balance/${ctx.from.id}-${env}`,
            method: 'get',
            timeout: 8000,
            headers: {
                'Content-Type': 'application/json',
            }
        })

        if(response.status == 200){
            // test for status you want, etc
            // console.log(response.status)
        }

        return response.data.balance
    } catch (err) {
        console.error(err);
    }

}
let airdropWallet = async (ctx:Scenes.SceneContext) => {
    if (!ctx.from) {
        return;
    }

    if (!ctx.message) {
        return;
    }

    // @ts-ignore
    let value = ctx.message?.text;

    try {
        let response = await axios({
            url: `http://localhost:3000/wallets/airdrop/${ctx.from.id}-${env}/${value}`,
            method: 'get',
            timeout: 8000,
            headers: {
                'Content-Type': 'application/json',
            }
        })

        if(response.status == 200){
            // test for status you want, etc
            // console.log(response.status)
        }
        // console.log(response.data);

        return response.data.wallet
    } catch (err) {
        console.error(err);
    }
}
let runAction =async (ctx: Scenes.SceneContext, action: string) => {
    if (!ctx.chat) {
        return;
    }

    switch (action) {
        case 'back':
            action = getPreviousScreen(ctx);
    }

    previousScreens.set(ctx.chat.id, getCurrentScreen(ctx));
    currentScreens.set(ctx.chat.id, action);

    activeChats.add(ctx.chat.id);
    previousScreens.set(ctx.chat.id, 'start');

    // ctx.replyWithMarkdownV2("*bold*, `test`");

    let userName = 'error';
    if (ctx.from) {
        userName = ctx.from.first_name;
    }

    const screen = screens.get(getCurrentScreen(ctx));
    if (!screen) {
        await ctx.replyWithHTML(
            'This feature is not available yet!'
        );
        return;
    }

    let screenText = screen.text;
    //TODO: replace checker model here
    if (screen.text.includes('{wallet}')) {
        let wallet = await getWallet(ctx);
        screenText = screenText.replace('{wallet}', wallet);
    }

    if (screen.text.includes('{balance}')) {
        let data = await getBalance(ctx);


        screenText = screenText.replace('{balance}', data.balance);
    }


    if (getCurrentScreen(ctx) === 'start') {
        screenText = `Hi ${userName}!\n${screenText}`
    }

    if (screen.scene) {
        await ctx.scene.enter(screen.scene);
        return;
    }

    if (!screen.keyboard) {
        await ctx.replyWithHTML(
            screenText
        );
        return;
    }

    if (!screen.columns) {
        screen.columns = 3;
    }

    //set markup markdown
    await ctx.replyWithHTML(
        screenText,
        Markup.inlineKeyboard(
            screen.keyboard.map((button: {
                text: string;
                action: string;
            }) => Markup.button.callback(button.text, button.action)),
            {columns: screen.columns}
        )
    );
}

/* END FUNCTIONS SETUP */

/* SCENES */

// Handler factories
const { enter, leave } = Scenes.Stage;

const question = new Scenes.BaseScene<Scenes.SceneContext>("question");

question.enter(ctx => {
    let screen = screens.get(getCurrentScreen(ctx));

    //@ts-ignore
    ctx.reply(`${screen.text}:`);
});
question.leave(async (ctx:Scenes.SceneContext) => await ctx.scene.leave());
question.on("message", async (ctx:Scenes.SceneContext) => {
    let screen = screens.get(getCurrentScreen(ctx));
    if (screen.processor) {
        await screen.processor(ctx);
    }

    // ctx.session.token = ctx.message.text;

    await runAction(ctx, screen.back);
    return ctx.scene.leave();

});

const stage = new Scenes.Stage([question]);
bot.use(stage.middleware());

/* END SCENES */


// bot.action(['update:contract', 'update:website', 'update:telegram', 'update:twitter', 'update:additional'], (ctx) => {
//     ctx.scene.enter("question");
// });






bot.start((ctx) => {
    runAction(ctx, 'start').then(r => {});
});

bot.help((ctx) => {
    ctx.reply('Send /start to receive a greeting');
    ctx.reply('Send /keyboard to receive a message with a keyboard');
    ctx.reply('Send /quit to stop the bot');
});

bot.command('quit', (ctx) => {
    activeChats.delete(ctx.chat.id);
});



bot.action(allActions, (ctx) => {
    if (!ctx.chat) {
        return;
    }

    if (!activeChats.has(ctx.chat.id)) {
        return;
    }

    let action = ctx.match.input;
    currentScreens.set(ctx.chat.id, action);
    runAction(ctx, action)
});

bot.use(async (ctx, next) => {
    console.log('middle start');

    await next();

    console.log('middle end');
})
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));





// let wallet = 'error';
// let currentScreen:any = 'start';
// const runStart = async (ctx: Context) => {
//     if (!ctx.from) {
//         return;
//     }
//
//     if (!ctx.chat) {
//         return;
//     }
//
//     activeChats.add(ctx.chat.id);
//     previousScreens.set(ctx.chat.id, 'start');
//
//     let userName = 'error';
//     if (ctx.from) {
//         userName = ctx.from.first_name;
//     }
//
//     const screen = screens.get(getCurrentScreen(ctx));
//    let screenText = screen.text;
//     if (screen.text.includes('{wallet}')) {
//         let wallet = await getWallet(ctx);
//         screenText = screenText.replace('{wallet}', wallet);
//     }
//
//     if (getCurrentScreen(ctx) === 'start') {
//         screenText = `Hi ${userName}!\n${screenText}`
//     }
//
//     //set markup markdown
//     await ctx.replyWithHTML(
//         screenText,
//         Markup.inlineKeyboard(
//             screen.keyboard.map((button: {
//                 text: string;
//                 action: string;
//             }) => Markup.button.callback(button.text, button.action)),
//             {columns: screen.columns}
//         )
//     );
// }