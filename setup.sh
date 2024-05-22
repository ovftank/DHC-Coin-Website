#!/bin/bash
set -e
system_update() {
    sudo apt update && sudo apt upgrade -y && sudo apt --fix-broken install && sudo apt autoremove --purge
}
install_nginx() {
    sudo apt-get install nginx -y
}
configure_nginx() {
    rm -f /etc/nginx/sites-enabled/default
    rm -f /etc/nginx/sites-available/default
    sudo cp ./default /etc/nginx/sites-available/default
    sudo ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
    sudo systemctl restart nginx
}
configure_pip() {
    mkdir -p ~/.config/pip/
    rm -f ~/.config/pip/pip.conf
    cat <<EOF >~/.config/pip/pip.conf
[global]
break-system-packages = true
EOF
}
update_path() {
    echo "export PATH=\"$HOME/.local/bin:\$PATH\"" >>"$HOME/.bashrc"
    source "$HOME/.bashrc"
}
install_python_dependencies() {
    sudo apt install -y python3 python3-distutils ca-certificates wget --fix-missing
    wget https://bootstrap.pypa.io/get-pip.py
    sudo python3 get-pip.py
}

setup_server() {
    pip install -r requirements.txt
    cp python.service /etc/systemd/system/python.service
    sudo systemctl daemon-reload
    chmod +x /root/start_gunicorn.sh
    sudo systemctl enable python.service

}
main() {
    system_update
    install_nginx
    configure_nginx
    configure_pip
    update_path
    install_python_dependencies
    setup_server
}
main
