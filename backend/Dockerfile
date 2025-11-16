# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends libsqlite3-0 \
	&& rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# make entrypoint executable
RUN chmod +x ./entrypoint.sh

# Use entrypoint that seeds DB only when needed, then starts server
CMD ["./entrypoint.sh"]
