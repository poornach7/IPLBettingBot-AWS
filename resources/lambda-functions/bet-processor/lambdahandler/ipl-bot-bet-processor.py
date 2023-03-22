import logging
import os
import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def ipl_bot_bet_processor_handler(event, context):
    logger.info(f"event = {event}")
    send_sns_message(event["message"]["text"])
    

def send_sns_message(message):
    sns_client = boto3.client("sns")

    subject = "Test message"
    send_sns(sns_client, subject, message)



def send_sns(client, subject, message):
    client.publish(
        TopicArn=os.environ['SNSTopicARN'],
        Subject=subject,
        Message=message,
    )