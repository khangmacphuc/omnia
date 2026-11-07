(() => {
  const data = JSON.parse(document.querySelector("#twin-data").textContent);
  const nodesById = new Map(data.nodes.map((node) => [node.id, node]));
  const query = document.querySelector("#query");
  const type = document.querySelector("#type");
  const status = document.querySelector("#status");
  const nodeList = document.querySelector("#node-list");
  const detail = document.querySelector("#detail");
  const edgeBody = document.querySelector("#edge-body");
  const count = document.querySelector("#count");
  let selectedId = data.nodes[0]?.id ?? null;

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
  const sourceLink = (sourceRef) => {
    const line = sourceRef.startLine === sourceRef.endLine ? sourceRef.startLine : sourceRef.startLine + "-" + sourceRef.endLine;
    return '<li><a href="../../' + encodeURI(sourceRef.path) + '" target="_blank" rel="noreferrer">' + escapeHtml(sourceRef.path) + ':' + line + '</a></li>';
  };

  function filteredNodes() {
    const needle = query.value.trim().toLowerCase();
    return data.nodes.filter((node) => {
      const matchesQuery = !needle || [node.id, node.label, node.type, node.description].join(" ").toLowerCase().includes(needle);
      const matchesType = type.value === "all" || node.type === type.value;
      const matchesStatus = status.value === "all" || node.status === status.value;
      return matchesQuery && matchesType && matchesStatus;
    });
  }

  function renderDetail(node) {
    if (!node) { detail.innerHTML = '<p class="muted">No node matches the current filters.</p>'; return; }
    detail.innerHTML = '<h3>' + escapeHtml(node.label) + '</h3>' +
      '<p><span class="status status-' + escapeHtml(node.status) + '">' + escapeHtml(node.status) + '</span> · <span class="node-type">' + escapeHtml(node.type) + '</span></p>' +
      '<p>' + escapeHtml(node.description) + '</p>' +
      '<h4>Source references</h4><ul>' + node.sourceRefs.map(sourceLink).join("") + '</ul>' +
      '<h4>Evidence IDs</h4><p class="muted">' + escapeHtml(node.evidenceIds.join(", ")) + '</p>';
  }

  function renderEdges() {
    edgeBody.innerHTML = data.edges.map((edge) => {
      const source = nodesById.get(edge.source);
      const target = nodesById.get(edge.target);
      return '<tr><td>' + escapeHtml(source?.label ?? edge.source) + '</td><td>' + escapeHtml(edge.type) + '</td><td>' + escapeHtml(target?.label ?? edge.target) + '</td><td>' + escapeHtml(edge.evidenceClass) + '</td><td>' + (edge.stale ? 'stale' : 'current') + '</td></tr>';
    }).join("");
  }

  function render() {
    const nodes = filteredNodes();
    if (!nodes.some((node) => node.id === selectedId)) selectedId = nodes[0]?.id ?? null;
    count.textContent = nodes.length + " of " + data.nodes.length + " nodes";
    nodeList.innerHTML = nodes.map((node) => '<button class="node" data-node-id="' + escapeHtml(node.id) + '" data-selected="' + (node.id === selectedId) + '">' +
      '<span class="node-title"><span class="node-label">' + escapeHtml(node.label) + '</span><span class="status status-' + escapeHtml(node.status) + '">' + escapeHtml(node.status) + '</span></span>' +
      '<span class="node-type">' + escapeHtml(node.type) + ' · ' + escapeHtml(node.id) + '</span>' +
      '<span class="muted">' + escapeHtml(node.description) + '</span></button>').join("");
    nodeList.querySelectorAll("[data-node-id]").forEach((button) => button.addEventListener("click", () => { selectedId = button.dataset.nodeId; render(); }));
    renderDetail(nodesById.get(selectedId));
  }

  const addOptions = (select, values) => values.sort().forEach((value) => { const option = document.createElement("option"); option.value = value; option.textContent = value; select.append(option); });
  addOptions(type, [...new Set(data.nodes.map((node) => node.type))]);
  addOptions(status, [...new Set(data.nodes.map((node) => node.status))]);
  [query, type, status].forEach((control) => control.addEventListener("input", render));
  document.querySelector("#revision").textContent = data.revisionId;
  document.querySelector("#snapshot").textContent = data.sourceSnapshot.hash;
  renderEdges();
  render();
})();
