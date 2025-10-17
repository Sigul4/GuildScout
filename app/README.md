# Discord Bot + Event processing service bootstraped by NEST.JS

## Launch instructions

1. Create .env file with provided variables
2. Run **./run.sh up dev** in terminal to start project, give permissions if needed 
3. Access prisma db dashboard view via http://localhost:5555
4. You might also need **npx prisma migrate dev**
5. Run **./run.sh down** to shut down docker