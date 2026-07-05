import { getDomains } from "@/lib/services/domains";
import { getProjects } from "@/lib/services/projects";
import { getTasks } from "@/lib/services/tasks";
import { createDomain, deleteDomain } from "@/lib/actions/domain-actions";
import { createProject, deleteProject } from "@/lib/actions/project-actions";
import { createTask, toggleTaskComplete } from "@/lib/actions/task-actions";

// This is an Async Server Component fetching directly from our new Services!
export default async function TestPlayground() {
  const domains = await getDomains();
  const projects = await getProjects();
  const tasks = await getTasks();

  return (
    <div className="p-8 space-y-12">
      <h1 className="text-3xl font-bold">Backend Test Playground</h1>

      {/* --- DOMAINS TEST --- */}
      <section className="border p-4 bg-gray-50 dark:bg-gray-900">
        <h2 className="text-xl font-bold mb-4">1. Domains</h2>
        <form action={createDomain} className="flex gap-2 mb-4">
          <input type="text" name="name" placeholder="Domain Name (e.g. Uni)" required className="border p-1 text-black" />
          <input type="color" name="color" defaultValue="#3b82f6" />
          <button type="submit" className="bg-blue-600 text-white px-3 py-1">Add Domain</button>
        </form>
        <pre className="text-xs overflow-auto max-h-40 bg-black text-green-400 p-2">
          {JSON.stringify(domains, null, 2)}
        </pre>
      </section>

      {/* --- PROJECTS TEST --- */}
      <section className="border p-4 bg-gray-50 dark:bg-gray-900">
        <h2 className="text-xl font-bold mb-4">2. Projects</h2>
        <form action={createProject} className="flex gap-2 mb-4">
          <input type="text" name="name" placeholder="Project Name" required className="border p-1 text-black" />
          <select name="domain_id" required className="border p-1 text-black">
            <option value="">Select Domain...</option>
            {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button type="submit" className="bg-blue-600 text-white px-3 py-1">Add Project</button>
        </form>
        <pre className="text-xs overflow-auto max-h-40 bg-black text-green-400 p-2">
          {JSON.stringify(projects, null, 2)}
        </pre>
      </section>

      {/* --- TASKS TEST --- */}
      <section className="border p-4 bg-gray-50 dark:bg-gray-900">
        <h2 className="text-xl font-bold mb-4">3. Tasks</h2>
        <form action={createTask} className="flex gap-2 mb-4">
          <input type="text" name="title" placeholder="Task Title" required className="border p-1 text-black" />
          <select name="domain_id" required className="border p-1 text-black">
            <option value="">Select Domain (Req)...</option>
            {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select name="project_id" className="border p-1 text-black">
            <option value="">Select Project (Opt)...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input type="date" name="due_date" className="border p-1 text-black" />
          <button type="submit" className="bg-blue-600 text-white px-3 py-1">Add Task</button>
        </form>
        
        {/* Render a simple checklist to test the toggle action */}
        <div className="mb-4">
            {tasks.map(task => (
                <form key={task.id} action={toggleTaskComplete.bind(null, task.id, task.is_completed)}>
                    <label className="flex gap-2 items-center cursor-pointer">
                        <button type="submit" className="border px-2 py-1 text-xs bg-gray-200 text-black">Toggle</button>
                        <span className={task.is_completed ? "line-through text-gray-500" : ""}>{task.title}</span>
                    </label>
                </form>
            ))}
        </div>

        <pre className="text-xs overflow-auto max-h-40 bg-black text-green-400 p-2">
          {JSON.stringify(tasks, null, 2)}
        </pre>
      </section>

    </div>
  );
}