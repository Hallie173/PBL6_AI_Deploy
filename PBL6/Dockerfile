# --- GIAI ĐOẠN 1: Build Code (Dùng Node) ---
FROM node:18-alpine as build-stage

WORKDIR /app

# Copy file thư viện trước để tận dụng cache của Docker
COPY package.json ./

# Cài đặt thư viện
RUN npm install

# Copy toàn bộ code vào
COPY . .

# Chạy lệnh build (Create React App sẽ tạo ra thư mục 'build')
RUN npm run build

# --- GIAI ĐOẠN 2: Chạy Web (Dùng Nginx) ---
FROM nginx:alpine as production-stage

# Copy thư mục 'build' từ giai đoạn 1 sang thư mục html của Nginx
COPY --from=build-stage /app/build /usr/share/nginx/html

# Copy file cấu hình Nginx vào
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở cổng 80 (cổng trong container)
EXPOSE 80

# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]