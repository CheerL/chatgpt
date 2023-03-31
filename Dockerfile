FROM python:3.10.9-alpine
WORKDIR /data
COPY requirements.txt requirements.txt
RUN apk update\
 && apk add --no-cache jpeg-dev zlib-dev\
 && apk add --no-cache --virtual build-deps build-base linux-headers\
 && pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt\
 && apk del build-deps build-base linux-headers zlib-dev

CMD ["uvicorn", "app:app", "--workers", "1", "--host", "0.0.0.0", "--port", "7050", "--env-file", ".env"]
