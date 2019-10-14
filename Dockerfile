FROM pierrezemb/gostatic:latest
COPY . /srv/http
CMD ["./goStatic"]
