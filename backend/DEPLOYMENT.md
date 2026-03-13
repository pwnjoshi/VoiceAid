# VoiceAid Backend Deployment Guide

Complete guide for deploying VoiceAid backend to production.

## Deployment Options

### Option 1: AWS Amplify (Recommended)

**Advantages:**
- Serverless deployment
- Auto-scaling
- Built-in CI/CD
- Easy environment management

**Steps:**

1. Push code to Git repository
```bash
git add .
git commit -m "Initial VoiceAid backend"
git push origin main
```

2. Connect to AWS Amplify
- Go to AWS Amplify Console
- Click "New app" → "Host web app"
- Select your Git provider
- Connect repository and branch

3. Configure build settings
- Use provided `amplify.yml`
- Set environment variables

4. Deploy
```bash
amplify publish
```

### Option 2: Docker + ECS

**Advantages:**
- Container-based deployment
- Easy scaling
- Consistent environments

**Steps:**

1. Build Docker image
```bash
docker build -f docker/Dockerfile -t voiceaid-backend:latest .
```

2. Push to ECR
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker tag voiceaid-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/voiceaid-backend:latest

docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/voiceaid-backend:latest
```

3. Create ECS cluster and service
- Use AWS Console or CLI
- Configure task definition
- Set environment variables

### Option 3: EC2 Instance

**Advantages:**
- Full control
- Cost-effective for small scale

**Steps:**

1. Launch EC2 instance
- Ubuntu 22.04 LTS
- t3.micro or larger
- Security group: Allow ports 80, 443, 3000

2. Install dependencies
```bash
sudo apt update
sudo apt install -y nodejs npm git

# Install PM2 for process management
sudo npm install -g pm2
```

3. Clone and setup
```bash
git clone YOUR_REPO_URL
cd backend
npm install
cp .env.example .env
# Edit .env with production values
```

4. Start application
```bash
pm2 start server.js --name "voiceaid-backend"
pm2 startup
pm2 save
```

5. Setup reverse proxy (Nginx)
```bash
sudo apt install -y nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/voiceaid

# Add:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/voiceaid /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] AWS credentials set up
- [ ] S3 bucket created and configured
- [ ] Bedrock Knowledge Base created
- [ ] Documents uploaded to S3
- [ ] Tests passing locally
- [ ] Code committed to Git
- [ ] Security review completed
- [ ] Monitoring configured
- [ ] Backup strategy in place

## Environment Variables

**Required for all deployments:**
```
NODE_ENV=production
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
S3_BUCKET_NAME=voiceaid-knowledge-docs
KNOWLEDGE_BASE_ID=xxx
```

**Optional:**
```
PORT=3000
LOG_LEVEL=info
```

## Monitoring & Logging

### CloudWatch Logs
```bash
# View logs
aws logs tail /aws/amplify/voiceaid-backend --follow

# Create log group
aws logs create-log-group --log-group-name /voiceaid/backend
```

### CloudWatch Metrics
- Request count
- Error rate
- Response time
- Knowledge base queries

### Alarms
Set up CloudWatch alarms for:
- High error rate (> 5%)
- High response time (> 5s)
- Low success rate (< 95%)

## Scaling

### Horizontal Scaling
- Amplify: Auto-scales automatically
- ECS: Increase task count
- EC2: Use Auto Scaling Group

### Vertical Scaling
- Increase instance size
- Increase memory allocation
- Increase CPU allocation

## Backup & Recovery

### Database Backups
- Enable S3 versioning
- Set up lifecycle policies
- Regular snapshots

### Disaster Recovery
- Multi-region deployment
- Automated failover
- Regular testing

## Security

### SSL/TLS
```bash
# Use AWS Certificate Manager
# Or Let's Encrypt with Certbot
sudo certbot certonly --nginx -d your-domain.com
```

### API Security
- Enable CORS properly
- Implement rate limiting
- Use API keys or OAuth
- Validate all inputs

### AWS Security
- Use IAM roles
- Enable CloudTrail
- Enable VPC Flow Logs
- Regular security audits

## Cost Optimization

### Amplify
- Use free tier for development
- Monitor build minutes
- Set up cost alerts

### S3
- Use Intelligent-Tiering
- Set lifecycle policies
- Enable versioning only if needed

### Bedrock
- Monitor query costs
- Use on-demand pricing
- Consider reserved capacity

## Rollback Procedure

### Amplify
```bash
# Redeploy previous version
amplify publish --invalidateCache
```

### Docker/ECS
```bash
# Rollback to previous image
aws ecs update-service --cluster voiceaid --service voiceaid-backend --force-new-deployment
```

### EC2
```bash
# Rollback code
git revert HEAD
pm2 restart voiceaid-backend
```

## Post-Deployment

1. Verify API endpoints
```bash
curl https://your-api.com/health
```

2. Test knowledge base queries
```bash
curl https://your-api.com/api/knowledge?query=test
```

3. Monitor logs and metrics
4. Set up alerts
5. Document deployment
6. Notify team

## Support

For deployment issues:
- Check CloudWatch logs
- Review AWS documentation
- Contact AWS support
- Check backend team documentation
