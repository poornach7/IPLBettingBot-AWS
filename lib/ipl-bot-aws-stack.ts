import * as cdk from 'aws-cdk-lib';
import path = require('path');
import { Construct } from 'constructs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Effect, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class IplBotAwsStack extends cdk.Stack {
  public readonly betProcessorLambda: Function;
  public readonly userNotificationLambda: Function;
  public readonly userNotificationSNSTopic: Topic;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.userNotificationLambda = new Function(this, 'IPLBot-UserNotificationLambda', {
      functionName: "ipl_bot_user_notification",
      description: 'Lambda service to reply to user messages',
      code: Code.fromAsset(path.join(__dirname, '../resources/lambda-functions/user-notification/lambdahandler')),
      handler: 'ipl-bot-user-notification.ipl_bot_user_notification_handler',
      memorySize: 512,
      timeout: Duration.seconds(900),
      runtime: Runtime.PYTHON_3_8,
      retryAttempts: 0,
      environment: {
        TG_TOKEN: <>,
        USER_ID: <>
      }
    });

    // SNS Topic
    this.userNotificationSNSTopic = new Topic(this, 'IPLBot-UserNotificationSystem', {
      displayName: 'IPLBot-UserNotificationSystem',
      topicName: 'IPLBot-UserNotificationSystem',
    });
    // SNS subscription to invoke lambda to route the message back to user
    this.userNotificationSNSTopic.addSubscription(new LambdaSubscription(this.userNotificationLambda))


    this.betProcessorLambda = new Function(this, 'IPLBot-BetProcessorLambda', {
      functionName: "ipl_bot_bet_processor",
      description: 'Lambda service to process the bets, calculate score and update match details',
      code: Code.fromAsset(path.join(__dirname, '../resources/lambda-functions/bet-processor/lambdahandler')),
      handler: 'ipl-bot-bet-processor.ipl_bot_bet_processor_handler',
      memorySize: 512,
      timeout: Duration.seconds(900),
      runtime: Runtime.PYTHON_3_8,
      retryAttempts: 0,
      environment: {
        SNSTopicARN: this.userNotificationSNSTopic.topicArn
      }
    });

    //Creating policy for lambda to publish to SNS
    const snsLambdaPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['sns:Publish'],
      resources: [this.userNotificationSNSTopic.topicArn],
    });
    const lambda_snsPolicy = new ManagedPolicy(this, 'Lambda-SNS-Access-Policy', {
      managedPolicyName: 'Lambda-SNS-Access-Policy',
      statements: [snsLambdaPolicy],
    });
    this.betProcessorLambda.role?.addManagedPolicy(lambda_snsPolicy);
  }
}
