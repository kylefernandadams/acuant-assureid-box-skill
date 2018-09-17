Government ID extraction Box Skill example powered by Acuant AssureID
=====================================================================

Creating and Deploying the Box Skill Example
--------------------------------------------
1) Review the following [documentation](https://developer.box.com/docs/creating-your-a-box-skill-using-serverless).
2) Clone this repo
```
git clone https://github.com/kylefernandadams/acuant-assureid-box-skill.git
```
3) Install Serverless
```
yarn global add serverless
```
OR
```
npm intall -g serverless
```
4) Configure Serverless with your AWS IAM credentials
```
serverless config credentials --provider aws --key YOURAPIKEY --secret YOURSECRET
```
5) Update the folowing environment variables in the [serverless.yml](https://github.com/kylefernandadams/acuant-assureid-box-skill/blob/master/serverless.yml) file
  * ASSURE_ID_USERNAME
  * ASSURE_ID_PASSWORD
  * ASSURE_ID_SUBSCRIPTION_ID
6) Deploy the lambda using serverless
```
serverless deploy -v
```
7) Test your AWS Lambda function
```
serverless invoke local --function index --data '{"key1":"value1"}'
```
8) Register your custom skill using the following [documentation](https://developer.box.com/docs/creating-your-a-box-skill-using-serverless#section-5-register-your-skill-application-with-box).
