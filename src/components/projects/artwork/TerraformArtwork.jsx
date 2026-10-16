export default function TerraformArtwork() {
  return (
    <div className="art terminalart" aria-hidden="true">
      <div className="microhead">
        ● ● ● <span>INFRASTRUCTURE / TERRAFORM</span>
      </div>
      <p>
        <b>›</b> terraform plan
      </p>
      <p className="green">+ aws_instance.demo_server</p>
      <p>
        <b>›</b> instance_type
      </p>
      <div className="codefocus">
        <small>RESOURCE CONFIGURATION</small>
        <strong>
          t3.micro<span> / EC2</span>
        </strong>
      </div>
      <p className="amber">Original lab stopped · hosting is planned</p>
    </div>
  );
}
