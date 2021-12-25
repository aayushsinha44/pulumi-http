from re import L
import pulumi
from pulumi import automation as auto
from pulumi.automation.errors import StackAlreadyExistsError
from pulumi_aws import s3
from flask import Flask, request
import uuid

app = Flask(__name__)
PROJECT_NAME = 'Pulumi-Website-Deployer-Multi-Cloud'

def create_aws_s3(content):
  bucket = s3.Bucket("s3-bucket", website=s3.BucketWebsiteArgs(index_document="index.html"))

  s3.BucketObject("index", 
                  bucket=bucket.id,
                  content=content,
                  key="index.html",
                  content_type="text/html; charset=utf-8")
  
  s3.BucketPolicy("policy",
                  bucket=bucket.id,
                  policy={
                    "Version": "2012-10-17",
                    "Statement": {
                      "Effect": "Allow",
                      "Principal": "*",
                      "Action": ["s3:GetObject"],
                      "Resource": [pulumi.Output.concat("arn:aws:s3:::", bucket.id, "/*")]
                    }
                  })
  
  pulumi.export("website_url", bucket.website_endpoint)

@app.route("/aws/sites", methods=["POST"])
def create_aws_website():
  stack_name = str(uuid.uuid4())
  content = request.json.get('content')

  access_key = request.json.get('access_key')
  secret_key = request.json.get('secret_key')

  if access_key == None or secret_key == None:
    return {"message": "AWS Keys are required"}, 400

  if content == None or content == "":
    return {"message": "content required"}, 400

  try:
    def pulumi_progam():
      return create_aws_s3(content)
    
    stack = auto.create_stack(stack_name=stack_name,
                              project_name=PROJECT_NAME,
                              program=pulumi_progam)
    stack.set_config("aws:region", auto.ConfigValue("us-west-2"))
    stack.set_config("aws:accessKey", auto.ConfigValue(value=access_key, secret=True))
    stack.set_config("aws:secretKey", auto.ConfigValue(value=secret_key, secret=True))

    up_res = stack.up(on_output=print)
    return {"id": stack_name, "website_url": up_res.outputs['website_url'].value}
  except auto.StackAlreadyExistsError:
    return {"message": "stack already exists"}, 400
  except Exception as e:
    return {"message": "something went wrong", "execption": str(e)}, 500

@app.route("/aws/sites/<string:id>", methods=["DELETE"])
def delete_aws_website(id):
  stack_name = id

  access_key = request.json.get('access_key')
  secret_key = request.json.get('secret_key')

  if access_key == None or secret_key == None:
    return {"message": "AWS Keys are required"}, 400
  try:
    stack = auto.select_stack(stack_name=stack_name,
                              project_name=PROJECT_NAME,
                              program=lambda *args: None)
    stack.set_config("aws:accessKey", auto.ConfigValue(value=access_key, secret=True))
    stack.set_config("aws:secretKey", auto.ConfigValue(value=secret_key, secret=True))
    stack.destroy(on_output=print)
    stack.workspace.remove_stack(stack_name)
    return {"message": "deleted successfully"}
    
  except auto.StackNotFoundError:
    return {"message": "stack not found"}, 400
  except auto.ConcurrentUpdateError:
    return {"message": "delete in progress"}, 400
  except Exception as e:
    return  {"message": "something went wrong", "execption": str(e)}, 500

if __name__ == "__main__":
  workspace = auto.LocalWorkspace()
  workspace.install_plugin("aws", "v4.0.0")
  app.run(host='0.0.0.0', port=3000, debug=True)
