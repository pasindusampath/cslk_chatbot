import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { catchError, lastValueFrom, map } from 'rxjs';
import { Logger } from '@nestjs/common';
@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name)
    constructor(private httpService:HttpService){}

    async sendWhatsappMessage(messageSender){
                this.logger.log('Sending Whatsapp Message');
                const data = {
                    "messaging_product": "whatsapp",    
                    "recipient_type": "individual",
                    "to": messageSender,
                    "type": "text",
                    "text": {
                        "preview_url": false,
                        "body": "Response from Bot "
                    }
                }
                const url = `https://graph.facebook.com/${process.env.WHATSAPP_CLOUD_API_VERSION}/${process.env.WHATSAPP_CLOUD_API_PHONE_NUMBER_ID}/messages`;
                const config = {
                    headers: { 
                      'Content-Type': 'application/json', 
                      'Authorization': `Bearer ${process.env.WHATSAPP_CLOUD_API_ACCESS_TOKEN}`
                    },
                };

                try{
                    const response = this.httpService.post(url , data, config).pipe(map((res) => {
                        return res.data;
                    })).pipe(catchError((error) => {
                        this.logger.error(error);
                        throw new BadRequestException('Error Posting to Whatsapp Cloud API')
                    }));
                    const messageSendingStatus = await lastValueFrom(response);
                    this.logger.log('Message Sent. status : '+messageSendingStatus);
                }catch(e){
                    this.logger.error(e);
                    return 'Axle broke!! Abort Mission!!';
                }
    }

}
