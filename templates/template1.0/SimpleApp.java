import java.util.List;

import com.snlab.maple.mapleclient.api.Identifier;
import com.snlab.maple.mapleclient.api.Link;
import com.snlab.maple.mapleclient.api.MapleApp;
import com.snlab.maple.mapleclient.api.Topology;
import com.snlab.maple.mapleclient.core.odl.ODLTopologyIdentifier;
import com.snlab.maple.mapleclinet.core.MapleClient;
import com.snlab.maple.mapleclinet.core.MapleConfig;
import com.snlab.maple.mapleclinet.core.tracetree.Action;
import com.snlab.maple.mapleclinet.core.tracetree.MaplePacket;

public class SimpleApp extends MapleApp{

	@Override
	public Action onPacket(MaplePacket p) {
		System.out.println("start onPacket");
		String srcMac = String.valueOf(p.ethSrc());
		String dstMac = String.valueOf(p.ethDst());
		if(srcMac.equals(dstMac))return null;
		System.out.println("sm != dm");
		Identifier<Topology> topoRef = new ODLTopologyIdentifier();
		Topology topo = ms.read(topoRef);
		System.out.println("get topology");
		List<Link> links = topo.getLinks();
		Link l1 = links.get(0);
		Action action = new Action();
		return action;
	}

	public static void main(String[] args){
		SimpleApp app = new SimpleApp();
		MapleClient client = new MapleClient();
		MapleConfig conf = new MapleConfig();
		conf.setControllerAddress("localhost");
		client.setup(conf);
		client.addMapleApp(app);
		client.register();
	}

	@Override
	public void onDataChanged(Object data) {
		// TODO Auto-generated method stub
		
	}
}
