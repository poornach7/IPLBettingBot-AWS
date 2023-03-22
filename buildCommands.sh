# AWS-Profile
ada credentials update --account=096816073494 --provider=isengard --role=Admin --profile=personal-ipl-account --once

# CDK build cmds
cdk synth
cdk bootstrap aws://096816073494/us-west-2
cdk deploy
