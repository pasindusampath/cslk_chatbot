import { BadRequestException, Controller, Get,HttpCode,Post,Req } from '@nestjs/common';
import { Request } from 'express';
import { WhatsappService } from './whatsapp.service';
import { json } from 'stream/consumers';

@Controller('whatsapp')
export class WhatsappController {
    
    constructor(
        private readonly whatsappService:WhatsappService
    ){}
    

    @Get('test')
    getHello(): string {
        return 'Hello World!';
    }

    @Get('webhook')
    whatsappVerificationChallenge(@Req() request:Request): any {
        const mode = request.query['hub.mode'];
        const challenge = request.query['hub.challenge'];
        const token = request.query['hub.verify_token'];
        
        const verificationToken = process.env.WHATSAPP_CLOUD_API_WEBHOOK_VERIFICATION_TOKEN;

        if (!mode || !token) {
            return 'Error verifying token';
        }

        if(mode === 'subscribe' && token === verificationToken) {
            return challenge?.toString();
        }
    }

    @Post('webhook')
    @HttpCode(200)
    async handleIncomingWhatsappMessage(@Req() request:any): Promise<any> {
        const messages =  request?.body?.entry[0]?.changes[0]?.value?.messages;
        if(!(messages))return;
        const messageData = messages[0];
        const sender = messageData?.from;
        switch(messageData?.type) {
            case 'text':
                await this.whatsappService.sendWhatsappMessage(sender);
                break;
        }
    }

}
