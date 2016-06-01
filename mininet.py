#!/usr/bin/env python
"""
run this file:
sudo -E python mininet.py {*.graphml}
"""

import sys
import json
import re
from mininet.net import Mininet
from mininet.topo import Topo
from mininet.link import TCLink
from mininet.node import RemoteController
from mininet.cli import CLI
from mininet.log import MininetLogger

ip_re = re.compile(r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$")

class MininetSimulator(object):

    def __init__(self, graph, controller_addr):
        self.graph = graph
        self.mininet_topo = Topo();
        self.controller_addr = controller_addr

    def generate_topo(self):
        nodes = self.graph["nodes"]
        edges = self.graph["edges"]
        for node in nodes:
            if node["class"] == "circleHClass":
                if (ip_re.match(node["title"])):
                    self.mininet_topo.addHost(node, ip=node["title"])
                else:
                    self.mininet_topo.addHost(node)
            elif node["class"] == "circleSClass":
                self.mininet_topo.addSwitch(node)
        for edge in edges:
            # set link properties here.
            # bw(Mbps), delay, loss, max_queue_size
            # source code is in {mininet_root}/mininet/link.py
            linkopts = dict()
            self.mininet_topo.addLink(edge[0], edge[1], **linkopts)

    def run(self):
        self.generate_topo()
        net = Mininet(topo=self.mininet_topo,
                controller=RemoteController,
                link=TCLink,
                build=False,
                autoStaticArp=True)
        net.addController(ip=self.controller_addr)
        net.start()
        CLI(net)
        net.stop()


def main():
    MininetLogger().setLogLevel(levelname="info")
    filename = sys.argv[1]
    g = json.load(filename)
    sim = MininetSimulator(g, sys.argv[2])
    sim.run()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print "Usage: ./mininet.py [GRAPHML_FILE] [CONTROLLER_ADDR]"
        sys.exit()
    main()
