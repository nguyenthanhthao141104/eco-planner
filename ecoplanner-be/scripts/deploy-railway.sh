#!/bin/bash

# ============================================
# EcoPlanner Backend - Railway Deployment Script
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   EcoPlanner Backend - Railway Deploy${NC}"
echo -e "${BLUE}============================================${NC}"

# Configuration
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH_NAME="be"
REMOTE_NAME="origin"

cd "$BACKEND_DIR"
echo -e "${GREEN}📁 Working directory: $BACKEND_DIR${NC}"

# Check if Railway CLI is installed
check_railway_cli() {
    if ! command -v railway &> /dev/null; then
        echo -e "${YELLOW}⚠️  Railway CLI not found. Installing...${NC}"
        npm install -g @railway/cli
        echo -e "${GREEN}✅ Railway CLI installed${NC}"
    else
        echo -e "${GREEN}✅ Railway CLI is installed${NC}"
    fi
}

# Login to Railway (if not already)
railway_login() {
    echo -e "${BLUE}🔐 Checking Railway authentication...${NC}"
    if ! railway whoami &> /dev/null; then
        echo -e "${YELLOW}Please login to Railway:${NC}"
        railway login
    else
        echo -e "${GREEN}✅ Already logged in to Railway${NC}"
    fi
}

# Build project locally to check for errors
build_project() {
    echo -e "${BLUE}🔨 Building project locally...${NC}"
    npm ci
    npx prisma generate
    npm run build
    echo -e "${GREEN}✅ Build successful${NC}"
}

# Create and push to 'be' branch
push_to_branch() {
    echo -e "${BLUE}📤 Pushing to branch '$BRANCH_NAME'...${NC}"
    
    # Check if branch exists
    if git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
        echo -e "${YELLOW}Branch '$BRANCH_NAME' exists. Switching...${NC}"
        git checkout $BRANCH_NAME
        git merge main --no-edit -m "Merge main into $BRANCH_NAME for deployment"
    else
        echo -e "${YELLOW}Creating new branch '$BRANCH_NAME'...${NC}"
        git checkout -b $BRANCH_NAME
    fi
    
    # Push to remote
    git push -u $REMOTE_NAME $BRANCH_NAME
    echo -e "${GREEN}✅ Pushed to $REMOTE_NAME/$BRANCH_NAME${NC}"
    
    # Switch back to main
    git checkout main
}

# Link and deploy to Railway
deploy_railway() {
    echo -e "${BLUE}🚂 Deploying to Railway...${NC}"
    
    # Check if project is linked
    if ! railway status &> /dev/null; then
        echo -e "${YELLOW}No Railway project linked. Creating/linking project...${NC}"
        echo -e "${YELLOW}Choose an option:${NC}"
        echo "1) Create new project"
        echo "2) Link existing project"
        read -p "Enter choice (1 or 2): " choice
        
        if [ "$choice" = "1" ]; then
            railway init
        else
            railway link
        fi
    fi
    
    echo -e "${GREEN}✅ Railway project linked${NC}"
    
    # Show environment variables that need to be set
    echo -e "${YELLOW}============================================${NC}"
    echo -e "${YELLOW}📋 Required Environment Variables on Railway:${NC}"
    echo -e "${YELLOW}============================================${NC}"
    echo "DATABASE_URL      - (Auto-set if you add PostgreSQL service)"
    echo "JWT_SECRET        - Your JWT secret key"
    echo "HUGGINGFACE_API_KEY - Your Hugging Face API key"
    echo "FRONTEND_URL      - Your frontend URL for CORS"
    echo "NODE_ENV          - production"
    echo ""
    
    # Deploy using Railway
    echo -e "${BLUE}🚀 Starting deployment...${NC}"
    railway up --detach
    
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}✅ Deployment initiated!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo -e "${BLUE}📌 Next steps:${NC}"
    echo "1. Go to Railway dashboard: https://railway.app/dashboard"
    echo "2. Add PostgreSQL service to your project"
    echo "3. Set the required environment variables"
    echo "4. Check deployment logs with: railway logs"
    echo ""
    echo -e "${BLUE}📌 Useful commands:${NC}"
    echo "  railway logs      - View deployment logs"
    echo "  railway status    - Check project status"
    echo "  railway open      - Open project in browser"
    echo "  railway variables - View/set environment variables"
}

# Main execution
main() {
    echo ""
    echo -e "${BLUE}Step 1/4: Checking Railway CLI${NC}"
    check_railway_cli
    
    echo ""
    echo -e "${BLUE}Step 2/4: Railway Authentication${NC}"
    railway_login
    
    echo ""
    echo -e "${BLUE}Step 3/4: Building Project${NC}"
    build_project
    
    echo ""
    echo -e "${BLUE}Step 4/4: Git Push & Deploy${NC}"
    push_to_branch
    deploy_railway
}

# Run with optional flags
case "${1:-}" in
    --push-only)
        echo -e "${BLUE}Push only mode${NC}"
        push_to_branch
        ;;
    --deploy-only)
        echo -e "${BLUE}Deploy only mode${NC}"
        check_railway_cli
        railway_login
        deploy_railway
        ;;
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --push-only     Only push to 'be' branch (skip Railway deploy)"
        echo "  --deploy-only   Only deploy to Railway (skip git push)"
        echo "  --help, -h      Show this help message"
        echo ""
        echo "Without options, runs full deployment pipeline."
        ;;
    *)
        main
        ;;
esac
